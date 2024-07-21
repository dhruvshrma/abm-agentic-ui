// Generic Agent-based Model Types

type EnvironmentState = EnvironmentState of obj
type AgentId = AgentId of int
type AgentInternalState = AgentInternalState of obj
type Action = Action of obj
type AgentPerception = AgentPerception of obj

type AgentPerceptionFunction = EnvironmentState -> AgentPerception
type AgentDecisionFunction = AgentInternalState * AgentPerception -> Action
type AgentStateUpdateFunction = AgentInternalState * AgentPerception * Action -> AgentInternalState
type EnvironmentUpdateFunction = EnvironmentState * Map<AgentId, Action> -> EnvironmentState

type Agent = {
    Id: AgentId;
    InternalState: AgentInternalState;
    PerceptionFunction: AgentPerceptionFunction;
    DecisionFunction: AgentDecisionFunction;
    StateUpdateFunction: AgentStateUpdateFunction;
}

type ABMSystem = {
    EnvironmentState: EnvironmentState;
    Agents: Map<AgentId, Agent>;
    EnvironmentUpdateFunction: EnvironmentUpdateFunction;
}

// Generic Form of ABM simulation function

let simulateABMStep (system: ABMSystem): ABMSystem =
    let agentActions =
        system.Agents
        |> Map.map (fun (_ agent) ->
            let perception = agent.PerceptionFunction system.EnvironmentState
            let action = agent.DecisionFunction (agent.InternalState, perception)
            let newInternalState = agent.StateUpdateFunction (agent.InternalState, perception, action)
            (action, { agent with InternalState = newInternalState }))
   let newEnvironment = system.EnvironmentUpdateFunction(system.EnvironmentState,
                                             Map.map(fun _ (action, _) -> action) agentActions)
   let newAgents = Map.map(fun _ (_, agent) -> agent) agentActions
   { system with Environment = newEnvironment; Agents = newAgents }
