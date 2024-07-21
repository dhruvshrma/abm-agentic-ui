// Generic Agentic UI System Types

type UIState = UIState of obj
type UIAction = UIAction of obj
type Usefulness = Usefulness of float


type Experience = {
    InitialState: UIState
    Action: UIAction
    FinalState: UIState
    Usefulness: Usefulness
}

type KnowledgeBase = Experience list

type StateTransitionFunction = UIState * UIAction -> UIState
type ActionSelectionFunction = UIState * KnowledgeBase -> UIAction
type UsefulnessEvaluationFunction = UIState * UIAction * UIState -> Usefulness
type KnowledgeUpdateFunction = KnowledgeBase * Experience -> KnowledgeBase

type AgenticUISystem = {
    CurrentState: UIState
    Knowledge: KnowledgeBase
    StateTransitionFunction: StateTransitionFunction
    ActionSelectionFunction: ActionSelectionFunction
    UsefulnessEvaluationFunction: UsefulnessEvaluationFunction
    KnowledgeUpdateFunction: KnowledgeUpdateFunction
}

let simulateAgenticUIStep (system: AgenticUISystem): AgenticUISystem =
    let action = system.ActionSelectionFunction (system.CurrentState, system.KnowledgeBase)
    let newState = system.StateTransitionFunction (system.CurrentState, action)
    let usefulness = system.UsefulnessEvaluationFunction (system.CurrentState, action, newState)
    let newExperience = {
            InitialState = system.CurrentState;
            Action = action;
            FinalState = newState;
            Usefulness = usefulness }
    let newKnowledge = system.KnowledgeUpdateFunction (system.KnowledgeBase, newExperience)
    { system with CurrentState = newState; Knowledge = newKnowledgeBase }