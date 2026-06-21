# API Contract: Soft Delete Product (Admin)

## `DELETE /api/admin/products/:id`

Soft-deletes (deactivates) a product. The product remains in the database but `is_active` is set to `false`.

### Response: `200 OK`

```json
{
  "message": "Product deactivated successfully."
}
```

### Error Responses

| Code | Reason |
|------|--------|
| 401 | Unauthenticated |
| 403 | Forbidden — missing `products.delete` permission |
| 404 | Product not found |

### Source

`Techa Auth API.postman_collection.json` → Admin → Admin Products → Soft Delete Product
