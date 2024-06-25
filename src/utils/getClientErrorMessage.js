export default function getClientErrorMessage(response) {
  // takes a Response object as input, attempts to read response as Json if possible,
  // and returns a Promise that resolves to a plain object with error key and text value.
  return new Promise((resolve) => {
    response.text().then((res) => {
      let response = JSON.parse(res);
      try {
        const jsonStr = JSON.parse(response.data);
        resolve({ message: jsonStr.ErrorMessage });
      } catch (err) {
        resolve({ message: JSON.stringify(response.data) });
      }
    });
  });
}
