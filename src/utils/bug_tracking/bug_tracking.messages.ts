import { Messages } from './bug_tracking.types';

export const errorMessages: Messages = {
  UNKNOWN_EXCEPTION: {
    code: '002-001',
    status: 500,
    component: 'unknown',
    description: 'Se ha producido una excepción desconocida.',
  },
  NOT_FOUND: {
    code: '002-002',
    status: 404,
    component: 'client',
    description: 'Recurso no encontrado.',
  },
};

export const authMessages: Messages = {
  UNAUTHORIZED: {
    code: '03-001',
    status: 401,
    component: 'auth',
    description: 'No autorizado. Acceso denegado.',
  },
  TOKEN_NOT_RECEIVED: {
    code: '03-002',
    status: 400,
    component: 'auth',
    description: 'Token no recibido.',
  },
};

export const validationMessages: Messages = {
  MISSING_ATTRIBUTE: {
    code: '04-001',
    status: 400,
    component: 'validations',
    description: 'Falta el atributo _nameAttribute.',
  },
  INVALID_ATTRIBUTE_TYPE: {
    code: '04-002',
    status: 400,
    component: 'validations',
    description:
      'El atributo _nameAttribute tiene un tipo de datos no válido. Esperado: _expectedType.',
  },
  ATTRIBUTE_LENGTH_EXCEEDED: {
    code: '04-003',
    status: 400,
    component: 'validations',
    description:
      'La longitud de _nameAttribute "_value" no puede superar _expectedCharacters.',
  },
  ATTRIBUTE_LENGTH_NOT_ENOUGH: {
    code: '04-003.1',
    status: 400,
    component: 'validations',
    description:
      'La longitud de _nameAttribute "_value" no puede ser menor a _expectedCharacters.',
  },
  INVALID_EMAIL: {
    code: '04-006',
    status: 400,
    component: 'validations',
    description: 'El correo electrónico introducido no es válido.',
  },
  DUPLICATE_VALUE: {
    code: '04-009',
    status: 409,
    component: 'validations',
    description:
      'El valor proporcionado para el atributo _nameAttribute ya está en uso.',
  },
  NOT_FOUND_ENTITY_BY_ID: {
    code: '04-010',
    status: 404,
    component: 'validations',
    description: 'El _nameValue "_value" proporcionado no existe en _resource.',
  },
  NOT_FOUND_PRODUCT: {
    code: '04-014',
    status: 404,
    component: 'validations',
    description:
      'El producto "_value" no existe o no se encuentra disponible para la compra.',
  },
};
