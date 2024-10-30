// Function that saves token in localStorage
export const setTokenAndDataInLocalStorage = (
  token: string,
  name: string,
  picture: string,
  id: string
) => {
  localStorage.setItem('token', token);
  localStorage.setItem('name', name);
  localStorage.setItem('picture', picture);
  localStorage.setItem('id', id);
};

// Function that recuperates the token from localStorage
export const getTokenAndDataFromLocalStorage = () => {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const picture = localStorage.getItem('picture');
  const id = localStorage.getItem('id');

  // If no token present send null
  if (!token) {
    return null;
  }

  // Else send data
  return { token, name, picture, id };
};

export const updateDataInLocalStorage = (
  newPicture: string,
  newName: string
) => {
  if (newName) {
    localStorage.setItem('name', newName);
  }
  if (newPicture) {
    localStorage.setItem('picture', newPicture);
  }
};

// Function to delete token when disconnecting
export const removeTokenFromLocalStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('picture');
  localStorage.removeItem('id');
};
