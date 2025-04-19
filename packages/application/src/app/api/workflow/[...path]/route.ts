import { getCurrentUser } from "@/lib/getCurrentUser";
import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

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

    // Clone the request for its body
    const requestBody = request.body ? await request.text() : null;

    // Forward the request to the workflow service
    const workflowResponse = await fetch(workflowServiceUrl, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : requestBody,
    });

    // Handle 304 Not Modified responses differently
    if (workflowResponse.status === 304) {
      // For 304, just return a response with the status code and headers, no body
      const response = new NextResponse(null, {
        status: 304,
        statusText: "Not Modified",
      });
      
      // Copy any needed headers
      workflowResponse.headers.forEach((value, key) => {
        if (!["content-length", "connection", "keep-alive"].includes(key.toLowerCase())) {
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

    return response;
  } catch (error) {
    console.error("Error forwarding request to workflow service:", error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = {
      error: "Failed to communicate with workflow service",
      details: errorMessage,
      url: workflowServiceUrl,
      // Include more debugging info here
    };

    return NextResponse.json(errorDetails, { status: 502 });
  }
}
