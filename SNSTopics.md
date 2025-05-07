| SNS Topic Config Key      | SNS Topic Resource                | SQS Subscription (Output Queue)   | Message Body Delivered to SQS  |
| ------------------------- | --------------------------------- | --------------------------------- | ------------------------------ |
| DOCUMENTS_TOPIC_ARN       | document_upload                   | structured_data_job_spawner_queue | Raw SNS message payload (JSON) |
| EXECUTIONS_TOPIC_ARN      | action_execution                  | action_execution_queue            | Raw SNS message payload (JSON) |
| INGESTION_TOPIC_ARN       | _Not found_                       | _Not found_                       |                                |
| DATA_EXTRACTION_TOPIC_ARN | _Not found_                       | _Not found_                       |                                |
| VECTOR_INDEX_TOPIC_ARN    | entity_index (ENTITIES_TOPIC_ARN) | entity_embeddings_queue           | Raw SNS message payload (JSON) |
