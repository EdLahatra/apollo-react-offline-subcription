export const validateEmail = (email) => {
  const regexEmail = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
  return regexEmail.test(email.trim());
};

export const validatePassword = password => password.length > 5;

export const validatePasswordConfirm = (passwordConfirm, password) => passwordConfirm === password;
