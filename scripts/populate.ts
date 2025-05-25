// ./populate.ts
import axios from 'axios';
import meliItemsTest from './resourses/meli-items-test.json';

const MELI_API_URL = 'https://api.mercadolibre.com/items';

interface MeliItem {
  title: string;
  category_id: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  buying_mode: string;
  condition: string;
  listing_type_id: string;
  seller_custom_field?: string;
  pictures: Array<{ source: string }>;
  shipping: {
    mode: string;
    local_pick_up: boolean;
    free_shipping: boolean;
    methods?: Array<any>;
  };
}

async function postSingleItem(
  itemData: MeliItem,
  accessToken: string
): Promise<void> {
  console.log(`Intentando crear item: "${itemData.title}"...`);
  try {
    const response = await axios.post(MELI_API_URL, itemData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(
      `✅ Item "${itemData.title}" creado con éxito! ID: ${response.data.id}`
    );
  } catch (error: any) {
    console.error(`❌ Error al crear item "${itemData.title}":`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    // Puedes decidir si continuar con el siguiente item o detener el script aquí
  }
}

export async function populateItems(): Promise<void> {
  const accessToken = process.env.MELI_ACCESS_TOKEN;

  if (!accessToken) {
    console.error(
      'Error: La variable de entorno MELI_ACCESS_TOKEN no está configurada.'
    );
    console.log(
      'Asegúrate de tener un archivo .env con MELI_ACCESS_TOKEN=TU_ACCESS_TOKEN_AQUI'
    );
    return;
  }

  if (!itemsToCreate || itemsToCreate.length === 0) {
    console.log(
      "No hay ítems para popular. Verifica tu archivo 'items-data.json'."
    );
    return;
  }

  console.log(
    `🚀 Iniciando la carga de ${itemsToCreate.length} ítems a Mercado Libre...`
  );

  for (const item of itemsToCreate as MeliItem[]) {
    // Hacemos type assertion aquí
    await postSingleItem(item, accessToken);
    // Opcional: Añadir una pequeña pausa para no saturar la API (ej. 500ms)
    // await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('🏁 Proceso de carga de ítems finalizado.');
}

// Esta parte permite ejecutar populateItems() si el script es llamado directamente
// (útil para algunas configuraciones de package.json, aunque usaremos -e)
if (require.main === module) {
  populateItems().catch((error) => {
    console.error('Error inesperado durante la populación:', error);
    process.exit(1);
  });
}
