import axios from "axios";
import { MongoClient } from "mongodb";

async function main() {
  // 1. Autenticar no Microsoft Graph
  const tokenRes = await axios.post(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AZURE_CLIENT_ID,
      client_secret: process.env.AZURE_CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default"
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const accessToken = tokenRes.data.access_token;

  // 2. Buscar dados no Microsoft Graph (exemplo pegando usuários)
  const graphRes = await axios.get(
    "https://graph.microsoft.com/v1.0/users",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const payload = {
    data: graphRes.data.value,
    coletadoEm: new Date()
  };

  // 3. Conectar no MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("minhaBase");
  const collection = db.collection("azureDados");

  // 4. Inserir no MongoDB
  await collection.insertOne(payload);
  console.log("Dados inseridos com sucesso no MongoDB");

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
