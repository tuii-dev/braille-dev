import { getCurrentUser } from "@/lib/getCurrentUser";
import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/logger";

// These methods will handle any HTTP verb
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Log the actual method from the request
  logger.info({
    message: "GET handler called",
    actualMethod: request.method,
    url: request.url,
    nextMethod: "GET",
  });

  return handleWorkflowRequest(request, params.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Clone the request for debugging POST handler
  const requestClone = request.clone();
  let requestBody = "";
  
  try {
    // Try to read the body to verify it exists
    requestBody = await requestClone.text();
  } catch (e) {
    logger.error({
      message: "Error reading request body in POST handler",
      error: e instanceof Error ? e.message : String(e)
    });
  }
  
  // Log the actual method from the request with more details
  logger.info({
    message: "POST handler explicitly called",
    actualMethod: request.method,
    url: request.url,
    bodyLength: requestBody.length,
    bodyExists: requestBody.length > 0,
    bodyPreview: requestBody.substring(0, 50),
    contentType: request.headers.get("content-type"),
  });

  // Check if this is truly a GET masquerading as a POST call
  if (request.method === "GET") {
    logger.warn({
      message: "POST handler received a GET request",
      url: request.url,
      // This is likely due to Next.js App Router behavior or middleware
    });
  }

  return handleWorkflowRequest(request, params.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return handleWorkflowRequest(request, params.path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return handleWorkflowRequest(request, params.path, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return handleWorkflowRequest(request, params.path, "PATCH");
}

// Central function to handle all request types
async function handleWorkflowRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string,
) {
  // Debug log to check if method is properly passed and request properties
  // Extract all headers for debugging
  const allHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });

  logger.info({
    message: "Method info in handleWorkflowRequest",
    passedMethod: method,
    actualRequestMethod: request.method,
    actualUrl: request.url,
    nextJsRouteMethod:
      request.nextUrl?.searchParams?.get("_method") || "not found",
    allHeaders: allHeaders,
    requestHasBody: request.body !== null,
    // Check for specific headers that might indicate method rewriting
    xForwardedMethod: allHeaders["x-forwarded-method"] || "not present",
    xHttpMethodOverride: allHeaders["x-http-method-override"] || "not present",
  });

  // Construct the URL to the workflow service using AWS Service Connect naming
  // Using the service discovery name from your service_connect_configuration
  const workflowServiceUrl = `${process.env.WORKFLOW_ENDPOINT}/${pathSegments.join("/")}`;

  try {
    // Optional: Skip authentication for now to debug connectivity
    // try {
    //   const session = await getSession();
    //   await getCurrentUser(session);
    // } catch (error) {
    //   return NextResponse.json(
    //     { error: "Unauthorized access" },
    //     { status: 401 }
    //   );
    // };

    // Get request headers and body
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Don't forward cookies, host, etc
      if (!["host", "cookie", "connection"].includes(key.toLowerCase())) {
        headers.append(key, value);
      }
    });

    // Set the content type if not already set
    if (!headers.has("content-type") && request.headers.get("content-type")) {
      headers.set(
        "content-type",
        request.headers.get("content-type") || "application/json",
      );
    }

    // Log the incoming request
    logger.info({
      message: "Workflow API proxy request",
      method,
      url: workflowServiceUrl,
      path: pathSegments.join("/"),
    });

    // Handle body extraction differently based on method
    let requestBody = null;

    // Force method string to uppercase to ensure consistency
    const normalizedMethod = method.toUpperCase();

    // Determine if this method might have a request body
    // Include DELETE since some controllers may use it with a body payload
    const methodsWithBody = ["POST", "PUT", "PATCH", "DELETE"];
    const shouldHaveBody = methodsWithBody.includes(normalizedMethod);

    if (shouldHaveBody) {
      // For methods that typically have a body, extract it
      try {
        requestBody = await request.text();

        // Ensure content-type is set for requests with body
        if (!headers.has("content-type")) {
          headers.set("content-type", "application/json");
        }

        // Log request body length but not content (for privacy)
        logger.debug({
          message: "Workflow API request body",
          bodyLength: requestBody ? requestBody.length : 0,
        });
      } catch (e) {
        logger.error({
          message: "Error extracting request body",
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    // Add debug headers to verify what's being sent
    headers.set("x-original-method", normalizedMethod);

    // For debugging in New Relic logs - this will help diagnose method overriding
    logger.info({
      message: "Request details before forwarding",
      method: normalizedMethod,
      path: pathSegments.join("/"),
      bodyPresent: !!requestBody,
      contentType: headers.get("content-type"),
      bodyPreview: requestBody ? requestBody.substring(0, 50) : "<none>",
    });

    // Forward the request to the workflow service with explicit method handling
    const workflowResponse = await fetch(workflowServiceUrl, {
      method: normalizedMethod,
      headers: headers,
      body: shouldHaveBody ? requestBody : undefined,
    });

    // Handle 304 Not Modified responses differently
    if (workflowResponse.status === 304) {
      // Log 304 Not Modified responses for monitoring and caching optimization
      logger.info({
        message: "Workflow API proxy 304 response",
        method: normalizedMethod,
        path: pathSegments.join("/"),
        status: 304,
        url: workflowServiceUrl,
        bodyPreview: requestBody ? requestBody.substring(0, 50) : "<none>",
      });

      // For 304, just return a response with the status code and headers, no body
      const response = new NextResponse(null, {
        status: 304,
        statusText: "Not Modified",
      });

      // Copy any needed headers
      workflowResponse.headers.forEach((value, key) => {
        if (
          !["content-length", "connection", "keep-alive"].includes(
            key.toLowerCase(),
          )
        ) {
          response.headers.set(key, value);
        }
      });

      return response;
    }

    // For all other responses, get the body and create a normal response
    const responseBody = await workflowResponse.arrayBuffer();

    // Create a response with the same status, headers, and body
    const response = new NextResponse(responseBody, {
      status: workflowResponse.status,
      statusText: workflowResponse.statusText,
    });

    // Copy workflow response headers to our response
    workflowResponse.headers.forEach((value, key) => {
      // Skip headers that are managed by Next.js
      if (
        !["content-length", "connection", "keep-alive"].includes(
          key.toLowerCase(),
        )
      ) {
        response.headers.set(key, value);
      }
    });

    // Log successful response
    logger.info({
      message: "Workflow API proxy response",
      status: workflowResponse.status,
      method,
      path: pathSegments.join("/"),
    });

    return response;
  } catch (error) {
    // Log the error
    logger.error({
      message: "Workflow API proxy error",
      error: error instanceof Error ? error.message : String(error),
      method,
      url: workflowServiceUrl,
      path: pathSegments.join("/"),
    });

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = {
      error: "Failed to communicate with workflow service",
      details: errorMessage,
      url: workflowServiceUrl,
    };

    return NextResponse.json(errorDetails, { status: 502 });
  }
}
