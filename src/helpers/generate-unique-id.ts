export const generateUniqueId = async () => {
  const { nanoid } = await import("nanoid");
  return nanoid()
};
