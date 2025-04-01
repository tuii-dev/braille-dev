import { Injectable } from '@nestjs/common';
import { DirectedGraph, DirectedAcyclicGraph, Graph } from 'typescript-graph';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';

@Injectable()
export class GraphService {
  getDirectedGraph(nodes: IWorkflowStep[]): DirectedGraph<IWorkflowStep> {
    return this.createGraph(nodes, DirectedGraph);
  }

  getDirectedAcyclicGraph(
    nodes: IWorkflowStep[],
  ): DirectedAcyclicGraph<IWorkflowStep> {
    return this.createGraph(nodes, DirectedAcyclicGraph);
  }

  createGraph<T extends Graph<IWorkflowStep>>(
    nodes: IWorkflowStep[],
    graphConstructor: new (nodeIdentity: (node: IWorkflowStep) => string) => T,
  ): T {
    // Create the graph using the provided constructor
    const graph = new graphConstructor((n) => n.nodeId);

    // First pass: Insert nodes
    nodes.forEach((node) => {
      graph.insert(node);
    });

    // Second pass: Create connectivity
    nodes
      .filter((node) => Array.isArray(node.edges) && node.edges.length > 0)
      .forEach((n) => {
        n.edges!.forEach((e) => {
          graph.addEdge(n.nodeId, e);
        });
      });

    return graph;
  }

  getNodesWithNoIncomingEdges<T>(graph: DirectedGraph<T>): IWorkflowStep[] {
    const allNodes = graph.getNodes() as IWorkflowStep[]; // Get all nodes in the graph

    // Filter nodes with an in-degree of 0
    const result: IWorkflowStep[] = [];
    allNodes.forEach((node) => {
      if (graph.indegreeOfNode(node.nodeId) === 0) {
        result.push(node);
      }
    });

    return result;
  }

  getNextStep(nodeId: string, nodes: IWorkflowStep[]): IWorkflowStep[] {
    const runnableNodes = [] as IWorkflowStep[];

    const targetNode = nodes.find((n) => n.nodeId === nodeId);

    if (targetNode) {
      if (targetNode.edges && targetNode.edges.length > 0) {
        targetNode.edges.forEach((e) => {
          const edgeNode = nodes.find((n) => n.nodeId === e);
          if (edgeNode) {
            runnableNodes.push(edgeNode);
          }
        });
      }
    }

    return runnableNodes;
  }

  hasSibling(nodeId: string, nodes: IWorkflowStep[]): boolean {
    return this.getNextStep(nodeId, nodes).length > 0;
  }
}
