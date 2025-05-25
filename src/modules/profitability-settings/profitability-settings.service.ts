// src/modules/profitability-settings/profitability-settings.service.ts
import { Repository } from 'typeorm';
import AppDataSource from '../../config/dataSource';
import { User } from '../user/user.entity';
import { UserProfitabilitySettings } from './profitability-settings.entity';
import { UpdateProfitabilitySettingsDto } from './profitability-settings.dto';
import { HttpException } from '../../utils/HttpException';

export class ProfitabilitySettingsService {
  private settingsRepository: Repository<UserProfitabilitySettings>;
  private userRepository: Repository<User>;

  constructor() {
    this.settingsRepository = AppDataSource.getRepository(
      UserProfitabilitySettings
    );
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getProfitabilitySettings(
    appUserId: string
  ): Promise<UserProfitabilitySettings | null> {
    const settings = await this.settingsRepository.findOne({
      where: { user: { id: appUserId } },
      // relations: ['user'], // Descomentar si necesitas cargar el usuario, pero no es necesario para devolver solo los settings
    });
    // Si no existen settings, podría ser la primera vez del usuario.
    // Podrías devolver un objeto con los defaults de la entidad o null.
    // Devolver null o un objeto vacío puede ser manejado por el frontend para mostrar un formulario "limpio".
    // O crearlos con defaults si no existen:
    if (!settings) {
      const user = await this.userRepository.findOneBy({ id: appUserId });
      if (!user)
        throw new HttpException(
          404,
          'Usuario no encontrado para obtener o crear configuraciones de rentabilidad.'
        );

      const defaultSettings = this.settingsRepository.create({ user });
      // Los valores por defecto de la entidad se aplicarán aquí
      return this.settingsRepository.save(defaultSettings);
    }
    return settings;
  }

  async updateProfitabilitySettings(
    appUserId: string,
    dto: UpdateProfitabilitySettingsDto
  ): Promise<UserProfitabilitySettings> {
    const user = await this.userRepository.findOneBy({ id: appUserId });
    if (!user) {
      throw new HttpException(404, 'Usuario no encontrado.');
    }

    let settings = await this.settingsRepository.findOne({
      where: { user: { id: appUserId } },
    });

    if (!settings) {
      // Si no existen, creamos una nueva instancia con el usuario y los datos del DTO
      console.log(
        `Creando nueva configuración de rentabilidad para el usuario ${appUserId}`
      );
      settings = this.settingsRepository.create({
        user,
        ...dto, // Aplicar los valores del DTO, los no provistos usarán defaults de la entidad
      });
    } else {
      // Si existen, actualizamos solo los campos proporcionados en el DTO
      console.log(
        `Actualizando configuración de rentabilidad para el usuario ${appUserId}`
      );
      // Object.assign(settings, dto); // Esto funciona, pero es mejor ser explícito o usar merge
      for (const key in dto) {
        if (dto[key as keyof UpdateProfitabilitySettingsDto] !== undefined) {
          (settings as any)[key] =
            dto[key as keyof UpdateProfitabilitySettingsDto];
        }
      }
    }

    try {
      return await this.settingsRepository.save(settings);
    } catch (error) {
      console.error(
        'Error al guardar la configuración de rentabilidad:',
        error
      );
      throw new HttpException(
        500,
        'Error al guardar la configuración de rentabilidad.'
      );
    }
  }
}
