# Guide: Managing Indexes

Indexes are the foundation of the Twelve Labs platform. They are containers that store your videos and their associated multimedia data, allowing you to perform powerful searches and analyses.

This guide will walk you through the complete lifecycle of managing indexes using the Twelve Labs JavaScript SDK.

## 1. Initializing the Client

First, make sure you have the SDK installed and the client initialized with your API key.

```typescript
import { TwelveLabsClient } from '@twelvelabs/sdk';

const client = new TwelveLabsClient({
  apiKey: 'YOUR_API_KEY',
});
```

## 2. Creating an Index

To start, you need to create an index. You must provide a name and specify the multimedia understanding engines you want to use.

The `create` method returns a promise that resolves to the newly created index object.

```typescript
import { TwelveLabsClient } from '@twelvelabs/sdk';

const client = new TwelveLabsClient({ apiKey: 'YOUR_API_KEY' });

async function createMyIndex() {
  try {
    const index = await client.indexes.create({
      name: 'my-first-index',
      engines: [
        {
          name: 'marengo3.0',
          options: ['visual', 'audio'],
        },
        {
          name: 'pegasus1.2',
          options: ['visual'],
        }
      ],
    });
    console.log('Index created:', index);
    return index;
  } catch (error) {
    console.error('Failed to create index:', error);
  }
}

createMyIndex();
```

**Key Parameters:**
- `name`: A unique name for your index.
- `engines`: An array of engine configurations.
  - `name`: The name of the engine model (e.g., `marengo3.0`).
  - `options`: The specific data you want to extract (e.g., `visual`, `audio`).

## 3. Listing Indexes

You can retrieve a paginated list of all your indexes. This is useful for displaying indexes in a UI or for administrative tasks.

```typescript
async function listAllIndexes() {
  try {
    const paginatedList = await client.indexes.list({
      page: 1,
      page_limit: 10,
      sort_by: 'created_at',
      sort_option: 'desc',
    });

    console.log(`Found ${paginatedList.page_info.total_result} indexes.`);
    paginatedList.data.forEach(index => {
      console.log(`- ID: ${index.id}, Name: ${index.name}`);
    });
  } catch (error) {
    console.error('Failed to list indexes:', error);
  }
}

listAllIndexes();
```

The `list` method returns a `PaginatedIndexes` object containing the `data` (an array of indexes) and `page_info`.

## 4. Retrieving a Specific Index

If you have an index ID, you can fetch its complete details using the `get` method.

```typescript
async function getIndexDetails(indexId: string) {
  try {
    const index = await client.indexes.get(indexId);
    console.log('Retrieved index details:', index);
  } catch (error) {
    console.error(`Failed to get index ${indexId}:`, error);
  }
}

// Example usage:
// getIndexDetails('your_index_id_here');
```

## 5. Updating an Index

You can update the name of an existing index. Note that other properties like the engines cannot be changed after creation.

```typescript
async function updateIndexName(indexId: string, newName: string) {
  try {
    const updatedIndex = await client.indexes.update(indexId, {
      name: newName,
    });
    console.log('Index updated successfully:', updatedIndex);
  } catch (error) {
    console.error(`Failed to update index ${indexId}:`, error);
  }
}

// Example usage:
// updateIndexName('your_index_id_here', 'my-renamed-index');
```

## 6. Deleting an Index

When you no longer need an index and all the videos within it, you can permanently delete it. **This action is irreversible.**

```typescript
async function deleteMyIndex(indexId: string) {
  try {
    await client.indexes.delete(indexId);
    console.log(`Index ${indexId} has been deleted.`);
  } catch (error) {
    console.error(`Failed to delete index ${indexId}:`, error);
  }
}

// Example usage:
// deleteMyIndex('your_index_id_here');
```

This covers the full CRUD (Create, Read, Update, Delete) lifecycle for managing your indexes with the SDK. With your indexes set up, you're ready to start [uploading videos](./uploading-videos.md).
