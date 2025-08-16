// scripts/coletar.js
import { MongoClient } from "mongodb";
import fetch from "node-fetch";

async function main() {
  try {
    // Variáveis de ambiente injetadas pelo workflow
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const mongoUri = process.env.MONGODB_URI;

    // Exemplo de pegar um token diretamente da Azure AD (sem login interativo)
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error(`Erro ao obter token: ${JSON.stringify(tokenData)}`);
    }

    console.log("✅ Token obtido com sucesso!");

    // Exemplo de chamada ao Microsoft Graph
    const graphResponse = await fetch("https://graph.microsoft.com/v1.0/users", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const users = await graphResponse.json();

    console.log(`Usuários retornados: ${users.value?.length || 0}`);

    // Conectar no MongoDB e salvar
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db("graphdb");
    const collection = db.collection("usuarios");

    await collection.insertMany(users.value || []);
    console.log("✅ Dados inseridos no MongoDB");

    await client.close();
  } catch (err) {
    console.error("❌ Erro no script:", err);
    process.exit(1);
  }
}

main();
