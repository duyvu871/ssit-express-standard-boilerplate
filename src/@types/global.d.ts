type ConditionalRequired<T, K extends keyof T, RequiredKeys extends keyof T = keyof T> =
  T[K] extends undefined | null ?
    Partial<T> :
    Required<Pick<T, RequiredKeys>> & Partial<Omit<T, RequiredKeys>>;