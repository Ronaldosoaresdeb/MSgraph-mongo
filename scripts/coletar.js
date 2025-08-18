import { MongoClient } from "mongodb";

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const token = process.env.AZURE_TOKEN;
    const azureCredentials = JSON.parse(process.env.AZURE_CREDENTIALS);
    const subscriptionId = azureCredentials.subscriptionId;

    if (!mongoUri || !token || !subscriptionId) {
      throw new Error("⚠️ Variáveis de ambiente faltando (MONGODB_URI, AZURE_TOKEN, subscriptionId)");
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
          subscriptions: [subscriptionId],
          query,
        }),
      }
    );

    if (!response.ok) throw new Error(`Erro no Resource Graph: ${response.statusText}`);

    const result = await response.json();
    const resources = result.data || [];

    console.log(`🔎 Storage Accounts encontrados: ${resources.length}`);

    if (resources.length > 0) {
      const novosInseridos = [];
      for (const res of resources) {
        // Checar se já existe pelo nome
        const existe = await collection.findOne({ name: res.name });
        if (existe) {
          console.log(`⚠️ Recurso já existe: ${res.name}`);
        } else {
          await collection.insertOne(res);
          novosInseridos.push(res.name);
        }
      }

      if (novosInseridos.length > 0) {
        console.log(`✅ Novos recursos inseridos: ${novosInseridos.join(", ")}`);
      } else {
        console.log("⚠️ Nenhum novo recurso foi inserido.");
      }
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
