import { useState, useCallback } from "react";

const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouchedState] = useState({});

  const validateField = useCallback(
    (name, value) => {
      const rule = validationRules[name];
      if (!rule) return "";

      if (rule.required && (!value || value.toString().trim() === "")) {
        return `${rule.label} is required`;
      }

      if (rule.minLength && value.length < rule.minLength) {
        return `${rule.label} must be at least ${rule.minLength} characters`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${rule.label} is invalid`;
      }

      return "";
    },
    [validationRules]
  );

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleTouched = useCallback(
    (name) => {
      setTouchedState((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, values[name]);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [values, validateField]
  );

  const validateAll = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach((name) => {
      newErrors[name] = validateField(name, values[name]);
    });
    setErrors(newErrors);
    setTouchedState(
      Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );
    return Object.values(newErrors).every((error) => !error);
  }, [values, validationRules, validateField]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched: handleTouched,
    validateAll,
    resetForm: () => {
      setValues(initialState);
      setErrors({});
      setTouchedState({});
    },
  };
};

export default useFormValidation;
