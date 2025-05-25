// src/modules/meli/meli.service.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config/appConfig';
import { User } from '../user/user.entity';
import AppDataSource from '../../config/dataSource';
import { HttpException } from '../../utils/HttpException';
import { MeliUserPublication } from '../meli-user-publications/meli-user-publications.entity';
import { Repository } from 'typeorm';

// Interfaz para la respuesta del token de MELI (al obtener o refrescar)
interface MeliTokenResponse {
  access_token: string;
  token_type: string; // suele ser "bearer"
  expires_in: number; // Duración en segundos
  scope: string;
  user_id: number; // El ID del usuario en MELI
  refresh_token: string;
}

// Interfaz para los items de la respuesta de /users/{user_id}/items/search
interface MeliSellerItemsResponse {
  seller_id: string;
  results: string[]; // Array de IDs de items (MLAxxxx)
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

// Interfaz simplificada para los detalles de un item de MELI de /items?ids=...
// La respuesta real es un array de objetos, donde cada objeto puede tener { code: 200, body: MeliItemDetail }
interface MeliItemDetail {
  id: string;
  title: string;
  price: number;
  category_id: string;
  // El SKU puede estar en attributes (como SELLER_SKU o ITEM_SKU) o en seller_custom_field (más antiguo)
  attributes: Array<{
    id: string;
    name: string;
    value_name: string | null;
    values: Array<{ name: string | null }>;
  }>;
  seller_custom_field?: string | null; // Campo más antiguo para SKU
  // ... otros campos que puedas necesitar ...
}

interface MeliMultiGetItemResponse {
  code: number;
  body: MeliItemDetail;
}

export class MeliService {
  private userRepository: Repository<User>;
  private meliUserPublicationRepository: Repository<MeliUserPublication>;
  private meliApi: AxiosInstance;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.meliUserPublicationRepository =
      AppDataSource.getRepository(MeliUserPublication);

    this.meliApi = axios.create({
      baseURL: 'https://api.mercadolibre.com',
    });
  }

  public async exchangeCodeForTokens(
    authCode: string,
    appUserId: string
  ): Promise<User> {
    if (
      !config.meli.appId ||
      !config.meli.clientSecret ||
      !config.meli.redirectUri ||
      !config.meli.tokenUrl
    ) {
      console.error(
        'MELI_SERVICE: Falta configuración crítica de MELI para el intercambio de tokens.'
      );
      throw new HttpException(
        500,
        'Error de configuración del servidor para la integración con MELI (exchange).'
      );
    }

    const tokenUrl = config.meli.tokenUrl;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', config.meli.appId);
    params.append('client_secret', config.meli.clientSecret);
    params.append('code', authCode);
    params.append('redirect_uri', config.meli.redirectUri);

    try {
      console.log(
        'MELI_SERVICE: Solicitando tokens a MELI con code:',
        authCode
      );
      const response = await axios.post<MeliTokenResponse>(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      });

      const tokenData = response.data;
      console.log(
        'MELI_SERVICE: Tokens recibidos de MELI (initial):',
        tokenData
      );

      const user = await this.userRepository.findOneBy({ id: appUserId });
      if (!user) {
        throw new HttpException(
          404,
          `Usuario de la aplicación con ID ${appUserId} no encontrado.`
        );
      }

      const expiresInMilliseconds = tokenData.expires_in * 1000;
      user.meli_user_id = tokenData.user_id;
      user.meli_access_token = tokenData.access_token; // TODO: Encriptar
      user.meli_refresh_token = tokenData.refresh_token; // TODO: Encriptar
      user.meli_token_expires_at = new Date(Date.now() + expiresInMilliseconds);
      user.meli_last_sync_at = new Date();

      await this.userRepository.save(user);
      console.log(
        `MELI_SERVICE: Tokens de MELI guardados para el usuario ${appUserId} (MELI User ID: ${tokenData.user_id})`
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        password_hash,
        meli_access_token,
        meli_refresh_token,
        ...userToReturn
      } = user;
      return userToReturn as User;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          'MELI_SERVICE: Error al intercambiar código por token con MELI:',
          error.response.data
        );
        throw new HttpException(
          error.response.status || 500,
          `Error de MELI al intercambiar token: ${error.response.data.message || error.response.data.error || 'Error desconocido'}`
        );
      }
      console.error(
        'MELI_SERVICE: Error inesperado al intercambiar código por token:',
        error
      );
      throw new HttpException(
        500,
        'Error interno al procesar la autorización de Mercado Libre.'
      );
    }
  }

  private async refreshTokenForUser(user: User): Promise<string> {
    if (!user.meli_refresh_token) {
      console.error(
        `MELI_SERVICE: No refresh token disponible para el usuario ${user.id}`
      );
      throw new HttpException(
        401,
        'No hay refresh token para renovar la sesión de MELI.'
      );
    }
    if (
      !config.meli.appId ||
      !config.meli.clientSecret ||
      !config.meli.tokenUrl
    ) {
      console.error(
        'MELI_SERVICE: Falta configuración crítica de MELI para el refresh de tokens.'
      );
      throw new HttpException(
        500,
        'Error de configuración del servidor para la integración con MELI (refresh).'
      );
    }

    console.log(
      `MELI_SERVICE: Refrescando token para usuario ${user.id} (MELI User ID: ${user.meli_user_id})`
    );
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', config.meli.appId);
    params.append('client_secret', config.meli.clientSecret);
    params.append('refresh_token', user.meli_refresh_token); // Asumir desencriptado

    try {
      const response = await axios.post<MeliTokenResponse>(
        config.meli.tokenUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        }
      );

      const tokenData = response.data;
      console.log('MELI_SERVICE: Tokens refrescados de MELI:', tokenData);

      const expiresInMilliseconds = tokenData.expires_in * 1000;
      user.meli_access_token = tokenData.access_token; // TODO: Encriptar
      user.meli_refresh_token = tokenData.refresh_token; // TODO: Encriptar (MELI puede devolver uno nuevo)
      user.meli_token_expires_at = new Date(Date.now() + expiresInMilliseconds);
      user.meli_last_sync_at = new Date(); // Actualizar fecha de sincronización

      await this.userRepository.save(user);
      console.log(
        `MELI_SERVICE: Tokens de MELI refrescados y guardados para el usuario ${user.id}`
      );
      return tokenData.access_token;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          'MELI_SERVICE: Error al refrescar token con MELI:',
          error.response.data
        );
        // Si el refresh token falla (ej. es inválido o revocado), el usuario necesitará reconectar.
        if (error.response.status === 400 || error.response.status === 401) {
          user.meli_access_token = null;
          user.meli_refresh_token = null;
          user.meli_token_expires_at = null;
          user.meli_user_id = null; // Podrías querer resetear esto también
          await this.userRepository.save(user);
          throw new HttpException(
            401,
            `Error al refrescar token de MELI (${error.response.data.message || error.response.data.error}). Por favor, reconecta tu cuenta de Mercado Libre.`
          );
        }
        throw new HttpException(
          error.response.status || 500,
          `Error de MELI al refrescar token: ${error.response.data.message || error.response.data.error || 'Error desconocido'}`
        );
      }
      console.error(
        'MELI_SERVICE: Error inesperado al refrescar token:',
        error
      );
      throw new HttpException(
        500,
        'Error interno al refrescar token de Mercado Libre.'
      );
    }
  }

  private async getValidMeliAccessToken(
    appUserId: string
  ): Promise<{ user: User; accessToken: string }> {
    const user = await this.userRepository.findOneBy({ id: appUserId });
    if (
      !user ||
      !user.meli_user_id ||
      !user.meli_access_token ||
      !user.meli_token_expires_at
    ) {
      throw new HttpException(
        401,
        'Usuario no conectado a Mercado Libre o información de token incompleta.'
      );
    }

    // Verificar si el token ha expirado (con un pequeño margen, ej. 5 minutos antes)
    const fiveMinutesInMs = 5 * 60 * 1000;
    if (
      new Date(user.meli_token_expires_at.getTime() - fiveMinutesInMs) <
      new Date()
    ) {
      console.log(
        `MELI_SERVICE: Token de acceso para ${user.id} expirado o por expirar. Intentando refresh.`
      );
      const newAccessToken = await this.refreshTokenForUser(user); // refreshTokenForUser guarda el usuario actualizado
      return { user, accessToken: newAccessToken }; // Devuelve el usuario (potencialmente actualizado por refreshTokenForUser)
    }

    return { user, accessToken: user.meli_access_token }; // Asumir desencriptado
  }

  private extractSkuFromMeliItem(itemDetail: MeliItemDetail): string | null {
    // Intenta con seller_custom_field primero (más antiguo)
    if (
      itemDetail.seller_custom_field &&
      itemDetail.seller_custom_field.trim() !== ''
    ) {
      return itemDetail.seller_custom_field.trim();
    }
    // Luego busca en los atributos
    if (itemDetail.attributes) {
      const skuAttribute = itemDetail.attributes.find(
        (attr) => attr.id === 'SELLER_SKU' || attr.id === 'ITEM_SKU'
      );
      if (skuAttribute) {
        if (skuAttribute.value_name && skuAttribute.value_name.trim() !== '') {
          return skuAttribute.value_name.trim();
        }
        // A veces el valor está en el primer elemento del array 'values'
        if (
          skuAttribute.values &&
          skuAttribute.values.length > 0 &&
          skuAttribute.values[0].name &&
          skuAttribute.values[0].name.trim() !== ''
        ) {
          return skuAttribute.values[0].name.trim();
        }
      }
    }
    return null;
  }

  public async fetchAndSaveUserPublications(
    appUserId: string
  ): Promise<MeliUserPublication[]> {
    const { user, accessToken } = await this.getValidMeliAccessToken(appUserId);

    try {
      console.log(
        `MELI_SERVICE: Iniciando obtención de publicaciones para MELI User ID: ${user.meli_user_id}`
      );

      const allItemIds: string[] = [];
      let currentOffset = 0;
      const limit = 50; // Límite por página (MELI suele ser 50, max 200 para algunos endpoints)
      let totalItems = 0;

      // 1. Obtener TODOS los IDs de las publicaciones del usuario (con paginación)
      do {
        console.log(
          `MELI_SERVICE: Obteniendo IDs de publicaciones, offset: ${currentOffset}, limit: ${limit}`
        );
        const itemsResponse = await this.meliApi.get<MeliSellerItemsResponse>(
          `/users/${user.meli_user_id}/items/search`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              status: 'active,paused', // Obtener activas y pausadas
              limit: limit,
              offset: currentOffset,
              // Puedes añadir más filtros si es necesario, como `tags: 'catalog_publication'`
            },
          }
        );

        if (
          itemsResponse.data.results &&
          itemsResponse.data.results.length > 0
        ) {
          allItemIds.push(...itemsResponse.data.results);
        }
        totalItems = itemsResponse.data.paging.total;
        currentOffset += limit;
      } while (currentOffset < totalItems);

      if (allItemIds.length === 0) {
        console.log(
          'MELI_SERVICE: No se encontraron publicaciones para el usuario.'
        );
        user.meli_last_publications_sync_at = new Date();
        await this.userRepository.save(user);
        return [];
      }
      console.log(
        `MELI_SERVICE: Encontrados ${allItemIds.length} IDs de publicaciones. Obteniendo detalles...`
      );

      // 2. Obtener detalles de cada publicación usando el endpoint multi-get (/items?ids=...)
      const detailedMeliItems: MeliItemDetail[] = [];
      const chunkSize = 20; // El endpoint /items?ids=... soporta hasta 20 IDs a la vez.

      for (let i = 0; i < allItemIds.length; i += chunkSize) {
        const chunkIds = allItemIds.slice(i, i + chunkSize);
        console.log(
          `MELI_SERVICE: Obteniendo detalles para IDs chunk: ${chunkIds.join(',')}`
        );
        const multiGetResponse = await this.meliApi.get<
          (MeliItemDetail | MeliMultiGetItemResponse)[]
        >(`/items`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { ids: chunkIds.join(',') },
        });

        // La respuesta de multi-get es un array donde cada elemento puede ser el item directamente o un objeto { code: 200, body: item }
        multiGetResponse.data.forEach((responseItem) => {
          if ('body' in responseItem && responseItem.code === 200) {
            detailedMeliItems.push(responseItem.body);
          } else if ('id' in responseItem) {
            // Si viene el item directamente
            detailedMeliItems.push(responseItem as MeliItemDetail);
          }
        });
      }

      const savedPublications: MeliUserPublication[] = [];

      for (const meliItem of detailedMeliItems) {
        if (!meliItem || !meliItem.id) {
          console.warn(
            'MELI_SERVICE: Item de MELI sin ID recibido, saltando.',
            meliItem
          );
          continue;
        }

        let publication = await this.meliUserPublicationRepository.findOne({
          where: { user: { id: user.id }, meli_item_id: meliItem.id },
        });

        const sku = this.extractSkuFromMeliItem(meliItem);

        if (publication) {
          // Actualizar existente
          publication.title = meliItem.title;
          publication.price_meli = meliItem.price;
          publication.category_id_meli = meliItem.category_id;
          publication.sku = sku;
          publication.publication_last_fetched_from_meli_at = new Date();
        } else {
          // Crear nueva
          publication = this.meliUserPublicationRepository.create({
            user: user, // Asignar la entidad User completa
            meli_item_id: meliItem.id,
            title: meliItem.title,
            price_meli: meliItem.price,
            category_id_meli: meliItem.category_id,
            sku: sku,
            publication_last_fetched_from_meli_at: new Date(),
          });
        }
        const saved =
          await this.meliUserPublicationRepository.save(publication);
        savedPublications.push(saved);
      }

      user.meli_last_publications_sync_at = new Date();
      await this.userRepository.save(user);

      console.log(
        `MELI_SERVICE: ${savedPublications.length} publicaciones guardadas/actualizadas de ${detailedMeliItems.length} items detallados obtenidos.`
      );
      return savedPublications;
    } catch (error: any) {
      if (error instanceof HttpException) throw error; // Re-lanzar HttpExceptions de getValidMeliAccessToken

      if (axios.isAxiosError(error) && error.response) {
        console.error(
          'MELI_SERVICE: Error Axios al obtener publicaciones de MELI:',
          { status: error.response.status, data: error.response.data }
        );
        // Si el error es 401 o 403 por token inválido (y el refresh ya falló o no se intentó antes), podría ser un problema persistente.
        if (error.response.status === 401 || error.response.status === 403) {
          throw new HttpException(
            error.response.status,
            `Error de autenticación con MELI al obtener publicaciones (${error.response.data.message || error.response.data.error}). Puede que necesites reconectar tu cuenta.`
          );
        }
        throw new HttpException(
          error.response.status || 500,
          `Error de MELI al obtener publicaciones: ${error.response.data.message || error.response.data.error || 'Error desconocido'}`
        );
      }
      console.error(
        'MELI_SERVICE: Error inesperado al obtener publicaciones:',
        error
      );
      throw new HttpException(
        500,
        'Error interno al obtener publicaciones de Mercado Libre.'
      );
    }
  }
}
