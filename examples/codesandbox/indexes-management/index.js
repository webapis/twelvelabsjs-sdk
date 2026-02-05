const { TwelveLabsClient } = require('@twelvelabs/sdk');

// =========================================================================================
// IMPORTANT: How to run this example
//
// 1. Create a `.env` file in this directory (examples/codesandbox/indexes-management)
// 2. Add your API key to the `.env` file:
//    TWELVE_LABS_API_KEY=your_api_key_here
//
// 3. Run `npm install` in this directory.
// 4. Run `npm start` to execute the script.
// =========================================================================================

// Simple .env loader
require('fs').readFileSync('.env', 'utf-8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) process.env[key.trim()] = value.trim();
});

const apiKey = process.env.TWELVE_LABS_API_KEY;
if (!apiKey) {
  throw new Error('API key is missing. Please follow the instructions above.');
}

const client = new TwelveLabsClient({ apiKey });

const indexName = `my-sdk-example-index-${Date.now()}`;
let indexId;

async function main() {
  console.log('Starting the Twelve Labs SDK Indexes example...');

  try {
    // 1. Create an index
    console.log(`\n1. Creating a new index named "${indexName}"...`);
    const createResult = await client.indexes.create({
      name: indexName,
      engines: [
        {
          name: 'marengo3.0',
          options: ['visual', 'audio'],
        },
      ],
    });
    indexId = createResult.id;
    console.log(`   ✅ Index created with ID: ${indexId}`);

    // 2. List all indexes
    console.log('\n2. Listing all indexes...');
    const paginatedList = await client.indexes.list();
    console.log(`   ✅ Found ${paginatedList.page_info.total_result} total indexes.`);
    const foundIndex = paginatedList.data.find(index => index.id === indexId);
    if (foundIndex) {
      console.log(`   ✅ Our new index "${foundIndex.name}" is in the list.`);
    } else {
      console.error('   ❌ Our new index was not found in the list.');
    }

    // 3. Get the specific index
    console.log(`\n3. Retrieving the index with ID: ${indexId}...`);
    const retrievedIndex = await client.indexes.get(indexId);
    console.log(`   ✅ Retrieved index. Name: "${retrievedIndex.name}", Engines:`, retrievedIndex.engines);

    // 4. Update the index
    const newIndexName = `${indexName}-updated`;
    console.log(`\n4. Updating the index name to "${newIndexName}"...`);
    const updatedIndex = await client.indexes.update(indexId, { name: newIndexName });
    console.log(`   ✅ Index updated. New name: "${updatedIndex.name}"`);

  } catch (error) {
    console.error('\nAn error occurred:', error.message);
  } finally {
    // 5. Delete the index for cleanup
    if (indexId) {
      console.log(`\n5. Cleaning up by deleting the index with ID: ${indexId}...`);
      try {
        await client.indexes.delete(indexId);
        console.log('   ✅ Index deleted successfully.');
      } catch (deleteError) {
        console.error('   ❌ Failed to delete index during cleanup:', deleteError.message);
      }
    }
  }

  console.log('\nExample finished.');
}

main();
