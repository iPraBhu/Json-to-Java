export const exampleJson = `{
  "id": 123,
  "name": "Acme Corp",
  "isActive": true,
  "createdAt": "2023-01-18T12:34:56Z",
  "address": {
    "street": "123 Main St",
    "city": "Metropolis",
    "postalCode": "12345"
  },
  "contacts": [
    {
      "type": "email",
      "value": "support@example.com"
    }
  ]
}`;

export const exampleSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Company",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "isActive": { "type": "boolean" },
    "createdAt": { "type": "string", "format": "date-time" },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "postalCode": { "type": "string" }
      }
    },
    "contacts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { "type": "string", "enum": ["email", "phone"] },
          "value": { "type": "string" }
        }
      }
    }
  }
}`;
