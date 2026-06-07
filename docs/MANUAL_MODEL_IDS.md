# Manual Model IDs

Some provider models do not appear from automatic model listing.

This happens when:

- The provider does not expose every model through `/models`.
- The provider requires an exact model ID.
- The model is available only through a router provider.
- The account key does not have access to that model.
- The model is experimental, private, renamed, retired, or region-limited.

## Solution

Use the new provider option:

```text
Manual Model ID
```

Default base URL:

```text
https://openrouter.ai/api/v1
```

Then paste the exact model ID from the provider model page into the Model field.

Examples of valid model ID shapes:

```text
provider/model-name
organization/model-name
author/model-name
custom-model-name
```

The app should not rely only on dropdowns. The model field is editable on purpose.

## Usage

1. Select `Manual Model ID`.
2. Paste the API key.
3. Confirm the base URL.
4. Paste the exact model ID into the Model field.
5. Click `Connect Cloud`.
6. Send a message.

## Notes

If a model fails:

- Check spelling and capitalization.
- Check that the provider account has access.
- Check that the base URL matches the provider.
- Try a known working model first.
- Some models are not available through every router/provider.

## Next App Upgrade

Add a dedicated Provider Setup screen with:

- Saved provider profiles
- Saved custom model IDs
- Model favorites
- Last-used model per provider
- Import/export provider settings
- OS keychain API key storage
