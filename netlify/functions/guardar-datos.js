const axios = require('axios'); // Necesitamos instalar axios más adelante

exports.handler = async (event) => {
    // 1. Verificar el método (solo aceptamos POST)
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Método no permitido" };
    }

    try {
        const data = JSON.parse(event.body);
        const nuevoContenidoJSON = JSON.stringify(data.contenido, null, 2);
        
        // El contenido debe ser codificado en Base64 para la API de GitHub
        const contenidoBase64 = Buffer.from(nuevoContenidoJSON).toString('base64');

        // --- Configuración de GitHub ---
        const owner = 'pueblacomparte369'; // ¡Cámbialo si es necesario!
        const repo = 'pueblacomparte369.github.io'; // ¡Cámbialo por el nombre de tu repositorio!
        const filePath = 'datos-simulador-campanias.json'; // Nombre del archivo a actualizar
        const message = 'Actualización en tiempo real desde la web';
        const branch = 'main'; // O 'master'

        // 2. Obtener la SHA (Hash) del archivo existente (NECESARIO para actualizar)
        const token = process.env.GITHUB_TOKEN; // Se obtiene de las Variables de Entorno de Netlify

        const getResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
            headers: { 'Authorization': `token ${token}` }
        });
        const currentSha = getResponse.data.sha;

        // 3. Preparar la solicitud PUT para actualizar el archivo
        const updateBody = {
            message: message,
            content: contenidoBase64,
            sha: currentSha, // ¡Crucial!
            branch: branch
        };

        // 4. Enviar la actualización a la API de GitHub
        await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, updateBody, {
            headers: { 
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Datos guardados en GitHub exitosamente." })
        };

    } catch (error) {
        console.error("Error al interactuar con GitHub:", error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error al guardar los datos.", details: error.message })
        };
    }
};