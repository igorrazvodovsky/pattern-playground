# Railway Deployment Guide

This guide provides step-by-step instructions for deploying both Storybook and the backend of Pattern Playground to Railway.

## Prerequisites

1. GitHub repository with your code
2. Railway account (sign up at [railway.app](https://railway.app))
3. Your OpenAI API key

## Step 1: Push Your Code to GitHub

Ensure your code is pushed to a GitHub repository. Railway works best with GitHub integration.

## Step 2: Set Up Railway Project

1. Log in to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your repository

## Step 3: Deploy Backend Service

1. In your Railway project, click "New Service" → "GitHub Repo"
2. Select your repository again
3. Configure the service:
   - **Name**: `pattern-playground-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Add environment variables:
   - Click on the "Variables" tab
   - Add `OPENAI_API_KEY` with your API key value
   - Add `PORT` with value `3000` (Railway will override this with its own port)

5. Deploy the service:
   - Railway will automatically deploy your backend
   - Note the service URL (e.g., `pattern-playground-backend-production.up.railway.app`)

## Step 4: Deploy Storybook

1. In your Railway project, click "New Service" → "GitHub Repo"
2. Select your repository again
3. Configure the service:
   - **Name**: `pattern-playground-storybook`
   - **Root Directory**: `/` (root of your repository)
   - **Build Command**: `npm install && npm run build-storybook`
   - **Start Command**: `npx serve -s storybook-static`

4. Add environment variables:
   - Click on the "Variables" tab
   - Add `VITE_API_URL` with the URL of your backend service (e.g., `https://pattern-playground-backend-production.up.railway.app`)

5. Deploy the service:
   - Railway will automatically deploy your Storybook
   - Note the service URL (e.g., `pattern-playground-storybook-production.up.railway.app`)

## Step 5: Connect Storybook to Backend

1. In your backend service, add the environment variable:
   - `FRONTEND_URL` with the URL of your Storybook service (e.g., `https://pattern-playground-storybook-production.up.railway.app`)

2. This will automatically update the CORS configuration to allow requests from your Storybook.

## Step 6: Set Up Custom Domain (Optional)

1. In your Railway project, click on your frontend service
2. Go to "Settings" tab
3. Scroll to "Domains" section
4. Click "Generate Domain" for a railway.app subdomain, or
5. Click "Custom Domain" to use your own domain

## Continuous Deployment

Railway automatically sets up continuous deployment:
1. When you push changes to your GitHub repository, Railway will automatically rebuild and redeploy
2. You can view deployment logs in the Railway dashboard

## Monitoring and Management

1. **Logs**: View logs in the "Deployments" tab
2. **Metrics**: Monitor resource usage in the "Metrics" tab
3. **Variables**: Manage environment variables in the "Variables" tab
4. **Settings**: Configure service settings in the "Settings" tab

## Cost Management

Railway's free tier gives you 500 hours per month of usage. Set up billing alerts in your Railway account settings to avoid unexpected charges.

## Troubleshooting Storybook Issues

If you encounter issues with Storybook loading pages after deployment, such as the error "manager received setCurrentStory but was unable to determine the source of the event", follow these steps:

1. Make sure your Storybook configuration is properly set up for production deployment:
   - In `.storybook/main.ts`, ensure you have the following configurations:
     ```typescript
     viteFinal: (config, { configType }) => {
       // Set base URL for production builds
       if (configType === 'PRODUCTION') {
         config.base = './';
       }
       return config;
     },
     staticDirs: ['../public'],
     core: {
       disableTelemetry: true,
     },
     ```

   - In `.storybook/manager-head.html`, ensure the favicon path is relative:
     ```html
     <link rel="icon" href="favicon.svg" type="image/svg+xml" />
     ```

   - Create a `.storybook/preview-head.html` file with the following content to fix iframe communication:
     ```html
     <!-- Fix for iframe communication issues -->
     <meta name="referrer" content="no-referrer" />
     <script>
       // Ensure proper communication between manager and preview
       window.PREVIEW_URL = window.location.href;

       // Fix for setCurrentStory issue
       window.addEventListener('message', function(event) {
         if (event.data && event.data.type === 'setCurrentStory') {
           // Force the event to be recognized by the manager
           window.parent.postMessage({
             type: 'setCurrentStory',
             args: event.data.args,
             from: window.PREVIEW_URL
           }, '*');
         }
       });
     </script>
     ```

2. After making these changes, rebuild and redeploy your Storybook:
   - Push the changes to your GitHub repository
   - Railway will automatically detect the changes and rebuild your Storybook
   - Monitor the deployment logs for any errors
