import { MongoClient } from "mongodb";

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const token = process.env.AZURE_TOKEN;
    const azurecredentians = process.env.AZURE_CREDENTIALS;

    if (!mongoUri || !token || !azurecredentians) {
      throw new Error("⚠️ Variáveis de ambiente faltando (MONGODB_URI, AZURE_TOKEN, AZURE_CREDENTIALS)");
    }

    // Conectar no MongoDB
    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    const db = client.db("resorceAzure");
    const collection = db.collection("azure-resourceblob");

    // Query Resource Graph
    const query = `
      resources
      | where type == "microsoft.storage/storageaccounts"
      | project name, id, location, resourceGroup
    `;

    const response = await fetch(
      `https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2021-03-01`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptions: [azurecredentians],
          query,
        }),
      }
    );

    if (!response.ok) throw new Error(`Erro no Resource Graph: ${response.statusText}`);

    const result = await response.json();
    const resources = result.data || [];

    console.log(`🔎 Storage Accounts encontrados: ${resources.length}`);

    if (resources.length > 0) {
      await collection.insertMany(resources);
      console.log("✅ Dados inseridos no MongoDB!");
    } else {
      console.log("⚠️ Nenhum recurso encontrado.");
    }

    await client.close();
  } catch (err) {
    console.error("❌ Erro no script:", err);
    process.exit(1);
  }
}

main();
