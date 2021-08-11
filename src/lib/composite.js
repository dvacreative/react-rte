// @flow

function composite(defaultFunc, customFunc) {
  return (input) => {
    console.log(input);
    if (customFunc) {
      let result = customFunc(input);
      if (result !== '') {
        return result; 
      }
    }
    return defaultFunc(input);
  };
}

export default composite;
