import axios from "axios";

const URL_API_AUTH = "https://projetback-r7o8.onrender.com/auth/profile";

const GetUser = async (accessToken) => {
    try {
      const response = await axios.get(URL_API_AUTH, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el usuario: ${error.message}`);
      return null;
    }
};

export default GetUser;