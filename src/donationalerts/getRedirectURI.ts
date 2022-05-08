const getRedirectURI = (isLocalhost: boolean) => {
  return isLocalhost
    ? 'http://localhost/api/v1/donationalerts/callback'
    : 'https://bruhitch.vercel.app/api/v1/donationalerts/callback';
};

export default getRedirectURI;
