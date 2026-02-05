# Implementation Status Tracker

Tracking progress for Twelve Labs SDK (API v1.3).

**Legend:**
- ✅ : Completed
- 🚧 : In Progress
- ❌ : Not Started
- ➖ : Not Applicable

## 1. Indexes (`/indexes`)
| Endpoint | SDK Method | Implemented | Unit Tests | Integration Tests | Documentation | CodeSandbox |
|----------|------------|:-----------:|:----------:|:-----------------:|:-------------:|:-----------:|
| `POST /indexes` | `client.indexes.create` | ✅ | ✅ | 🚧 (Auth Error) | ✅ | ❌ |
| `GET /indexes` | `client.indexes.list` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `GET /indexes/{id}` | `client.indexes.get` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `PUT /indexes/{id}` | `client.indexes.update` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `DELETE /indexes/{id}` | `client.indexes.delete` | ✅ | ✅ | 🚧 (Auth Error) | ✅ | ❌ |

## 2. Videos (`/indexes/{index_id}/videos`)
| Endpoint | SDK Method | Implemented | Unit Tests | Integration Tests | Documentation | CodeSandbox |
|----------|------------|:-----------:|:----------:|:-----------------:|:-------------:|:-----------:|
| `POST .../videos` | `client.videos.upload` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET .../videos` | `client.videos.list` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET .../videos/{id}` | `client.videos.get` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `PUT .../videos/{id}` | `client.videos.update` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DELETE .../videos/{id}` | `client.videos.delete` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET .../transcription` | `client.videos.getTranscription` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET .../text-in-video` | `client.videos.getTextInVideo` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET .../logo` | `client.videos.getLogo` | ❌ | ❌ | ❌ | ❌ | ❌ |

## 3. Search (`/search`)
| Endpoint | SDK Method | Implemented | Unit Tests | Integration Tests | Documentation | CodeSandbox |
|----------|------------|:-----------:|:----------:|:-----------------:|:-------------:|:-----------:|
| `POST /search` | `client.search.query` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /search/advanced` | `client.search.advanced` | ❌ | ❌ | ❌ | ❌ | ❌ |

## 4. Embeddings (`/embed`)
| Endpoint | SDK Method | Implemented | Unit Tests | Integration Tests | Documentation | CodeSandbox |
|----------|------------|:-----------:|:----------:|:-----------------:|:-------------:|:-----------:|
| `POST /embed` | `client.embeddings.create` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /embed/tasks/{id}` | `client.embeddings.getTask` | ❌ | ❌ | ❌ | ❌ | ❌ |

## 5. Tasks (`/summarize`, `/generate`, `/classify`)
| Endpoint | SDK Method | Implemented | Unit Tests | Integration Tests | Documentation | CodeSandbox |
|----------|------------|:-----------:|:----------:|:-----------------:|:-------------:|:-----------:|
| `POST /summarize` | `client.tasks.summarize` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /generate` | `client.tasks.generate` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /classify` | `client.tasks.classify` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /tasks/{id}` | `client.tasks.get` | ❌ | ❌ | ❌ | ❌ | ❌ |

## 6. Entities (`/entities`)
| Endpoint | SDK Method | Implemented | Unit Tests | Integration Tests | Documentation | CodeSandbox |
|----------|------------|:-----------:|:----------:|:-----------------:|:-------------:|:-----------:|
| `GET /entities` | `client.entities.list` | ❌ | ❌ | ❌ | ❌ | ❌ |
