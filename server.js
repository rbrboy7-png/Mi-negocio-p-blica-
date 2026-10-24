import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json({ limit: "15mb" }));

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

app.get("/", (_req, res) => {
  res.type("text").send("Mi Negocio Publica: servidor activo.");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(client) });
});

app.post("/api/image", async (req, res) => {
  if (!client) {
    return res.status(503).json({
      error: "La IA aún no está configurada en el servidor."
    });
  }

  const prompt = typeof req.body?.prompt === "string"
    ? req.body.prompt.trim()
    : "";

  if (!prompt) {
    return res.status(400).json({
      error: "Escribe una descripción para la imagen."
    });
  }

  try {
    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    const imageData = result.data?.[0]?.b64_json;

    if (!imageData) {
      return res.status(502).json({
        error: "La API no devolvió ninguna imagen."
      });
    }

    res.json({ image: `data:image/png;base64,${imageData}` });
  } catch (error) {
    console.error("Error al generar la imagen:", error.message);

    res.status(500).json({
      error: "No se pudo generar la imagen. Comprueba el saldo y la configuración de la API."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
