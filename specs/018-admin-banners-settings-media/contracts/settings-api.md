# Settings API Contract

## Base URL

All endpoints are prefixed with `/api/admin`.

## Authentication

All endpoints require `Authorization: Bearer {{admin_token}}` header.

## Endpoints

### Get All Settings

```
GET /api/admin/settings
```

**Query Parameters:** None

**Response (200):**
```json
{
  "data": {
    "general": [
      {
        "key": "site_name",
        "value": "Techa Marketplace",
        "type": "string",
        "is_active": true
      },
      {
        "key": "currency",
        "value": "EGP",
        "type": "string",
        "is_active": true
      }
    ],
    "payment": [
      {
        "key": "instapay_handle",
        "value": "@techa",
        "type": "string",
        "is_active": true
      },
      {
        "key": "vodafone_cash_number",
        "value": "01000000000",
        "type": "string",
        "is_active": true
      }
    ]
  }
}
```

**Permissions:** Requires `settings.read`.

**Note:** The `type` field determines which input to render. Known types: `string`, `textarea`, `boolean`, `image`, `color`, `number`. The `is_active` flag may be used to gray out inactive settings.

---

### Bulk Update Settings

```
PUT /api/admin/settings
```

**Request Body:**
```json
{
  "settings": {
    "site_name": "Techa Updated",
    "currency": "USD"
  }
}
```

**Description:** Only existing keys are updated. Unknown keys are returned as `not_found`.

**Response (200):**
```json
{
  "message": "Settings updated successfully.",
  "updated": ["site_name", "currency"],
  "not_found": []
}
```

**Permissions:** Requires `settings.update`.

## Error Responses

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "settings": ["Invalid setting value for site_name"]
  }
}
```

### Not Found Keys Warning (200 with not_found array)
```json
{
  "message": "Some settings were not found.",
  "updated": [],
  "not_found": ["nonexistent_key"]
}
```
