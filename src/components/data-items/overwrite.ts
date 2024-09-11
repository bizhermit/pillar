export const $required = <D extends DataItem.$object>(di: D) => {
  return { ...di, required: true } as Omit<D, "required"> & { required: true };
};

export const $optional = <D extends DataItem.$object>(di: D) => {
  return { ...di, required: false } as Omit<D, "required"> & { required: false };
};
