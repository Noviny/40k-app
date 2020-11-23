import { useMemo, useState } from "react";
import { useMutation } from "@ts-gql/apollo";

const debounce = (func, wait = 1000) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func(...args), wait;
    });
  };
};

const useDebouncedState = (state, mutation) => {
  const [mutationMutation] = useMutation(mutation);
  const [value, updateValue] = useState(state);

  useMemo(() => updateValue(state), [JSON.stringify(state)]);

  const debounced = debounce(
    ({ skipUpdate, ...val }) =>
      !skipUpdate &&
      mutationMutation({
        variables: val,
      })
  );

  useMemo(() => debounced(value), [value]);

  return [value, updateValue];
};

export default useDebouncedState;
