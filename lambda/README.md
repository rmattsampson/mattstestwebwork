# Lambda Deployment Instructions

## Step 1: Create Lambda Functions

1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda/
2. Click **"Create function"**

### Function 1: getSatellites

- **Function name**: `satellite-tracker-getSatellites`
- **Runtime**: Node.js 20.x
- **Architecture**: arm64 (cheaper)
- Click **"Create function"**
- Copy the code from `getSatellites.js` into the code editor
- Click **"Deploy"**
- Go to **Configuration** → **General configuration** → Edit
  - Timeout: 30 seconds
  - Save

### Function 2: getLocation

- **Function name**: `satellite-tracker-getLocation`
- **Runtime**: Node.js 20.x
- **Architecture**: arm64
- Click **"Create function"**
- Copy the code from `getLocation.js` into the code editor
- Click **"Deploy"**

## Step 2: Create API Gateway

1. Go to API Gateway Console: https://console.aws.amazon.com/apigateway/
2. Click **"Create API"**
3. Choose **"HTTP API"** (simpler and cheaper)
4. Click **"Build"**
5. **Add integrations**:
   - Click "Add integration"
   - Select "Lambda"
   - Choose `satellite-tracker-getSatellites`
   - Click "Add integration"
   - Click "Add integration" again
   - Select "Lambda"
   - Choose `satellite-tracker-getLocation`
6. **Configure routes**:
   - API name: `satellite-tracker-api`
   - Click "Next"
7. **Configure routes**:
   - Route 1: `GET /api/satellites` → `satellite-tracker-getSatellites`
   - Route 2: `GET /api/location` → `satellite-tracker-getLocation`
   - Click "Next"
8. **Define stages**:
   - Stage name: `prod`
   - Click "Next"
9. Click **"Create"**

## Step 3: Get Your API URL

After creation, you'll see your **Invoke URL** like:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

## Step 4: Update Frontend

In `frontend/src/main.ts`, change:
```typescript
const BACKEND_URL = 'https://YOUR_API_GATEWAY_URL/prod';
```

## Step 5: Test

Test your endpoints:
- https://YOUR_API_GATEWAY_URL/prod/api/satellites?lat=38.9&lon=-77.0
- https://YOUR_API_GATEWAY_URL/prod/api/location?lat=38.9&lon=-77.0

## Benefits of Lambda

- ✅ No server management
- ✅ Pay only for requests (very cheap)
- ✅ Auto-scales
- ✅ Free tier: 1M requests/month
- ✅ No need to keep server running
