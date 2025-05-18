/**
 * replaceDynamicData
 * @param description string
 * @param data data para remplazar los campos dinámicos
 * @returns description con los campos dinamicos cambiados
 */
export const replaceDynamicData = (
  description: string,
  data: { [key: string]: string }
): string => {
  if (!data) {
    return description;
  }

  let replacedDescription: string = description;

  for (const key in data) {
    const dynamicKey = `${key}`;
    replacedDescription = replacedDescription.replace(
      new RegExp(dynamicKey, 'g'),
      data[key]
    );
  }

  return replacedDescription;
};
