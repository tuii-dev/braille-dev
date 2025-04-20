import { getCurrentUser } from "@/lib/getCurrentUser";
import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/logger";

// These methods will handle any HTTP verb
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return handleWorkflowRequest(request, params.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Pass through to central request handler
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
  // Start processing the request

  // Construct the URL to the workflow service using AWS Service Connect naming
  // Using the service discovery name from your service_connect_configuration
  const workflowServiceUrl = `${process.env.WORKFLOW_ENDPOINT}/${pathSegments.join("/")}`;

  try {
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

    // Log basic request info
    logger.info({
      message: "Workflow API proxy request",
      method: method.toUpperCase(),
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
      } catch (e) {
        logger.error({
          message: "Error extracting request body",
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    // Forward the request to the workflow service with explicit method handling
    const workflowResponse = await fetch(workflowServiceUrl, {
      method: normalizedMethod,
      headers: headers,
      body: shouldHaveBody ? requestBody : undefined,
      cache: "no-store" // Prevent caching
    });

    // Handle 304 Not Modified responses differently
    if (workflowResponse.status === 304) {
      // 304 Not Modified response handling

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
