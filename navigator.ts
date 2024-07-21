import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();


type UIState = string;
type Action = string;
type TaskDescription = string;
type ActionEvaluation = {
    action: Action;
    state: UIState;
    usefulness: number;
};

class SelfImprovingUINavigator{
    private openai: OpenAI;
    private currentState: UIState;
    private taskDescription: TaskDescription;
    private actionHistory: Action[] = [];
    private knowledgeBase: ActionEvaluation[] = [];
    private simulatedUI: Map<string, string[]>; // For simplicity, we'll simulate the UI as a map of states to possible actions

    constructor(openai: OpenAI, initialState: UIState, taskDescription: TaskDescription){
        this.openai = openai;
        this.currentState = initialState;
        this.taskDescription = taskDescription;
        this.simulatedUI = new Map([
            ['Home Page', ['Click Sign Up', 'Enter Username', 'Enter Password']],
            ['Sign Up Page', ['Enter Email', 'Enter Phone Number', 'Submit']],
            ['Confirmation Page', ['Click Verify Email', 'Enter Verification Code', 'Submit']],
            ['Account Created Page', ['Click Continue to Dashboard']]
        ]);
    }

    async navigate(): Promise<void> {
        console.log(`Starting navigation. Initial state: ${this.currentState}`);
        console.log(`Task: ${this.taskDescription}`);

        while (!this.isTaskComplete()){
            console.log(`\nCurrent State: ${this.currentState}`);
            console.log(`Available Actions: ${this.simulatedUI.get(this.currentState)?.join(', ')}`);

            const action = await this.decideNextAction();
            console.log(`Decided to perform action: ${action}`);

            const previousState = this.currentState;
            this.currentState = await this.performAction(action);
            this.actionHistory.push(action);

            const usefulness = await this.evaluateAction(previousState, action, this.currentState);
            console.log(`Usefulness of action: ${usefulness}`);
            this.updateKnowledgeBase(previousState, action, usefulness);
        }
        console.log('Task Completed. Action History:', this.actionHistory);
    }

    private async decideNextAction(): Promise<Action> {
        const MAX_EXPERIENCE = 5; // Limit of cognition as it were

        const relevantExperiences = this.getRelevantExperiences(this.currentState).slice(0, MAX_EXPERIENCE);
        const availableActions = this.simulatedUI.get(this.currentState) || [];

        const prompt = `
            Task: ${this.taskDescription}
            Current UI State: ${this.currentState}
            Action History: ${this.actionHistory.join(", ")}
            Relevant Past Experiences: ${JSON.stringify(relevantExperiences)}
            
            Based on the current UI state, your understanding of typical web interfaces and the relevant past experiences, what action should be taken next to progress towards completing the task? Respond with a specific action description.
            `;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages:[ {role: 'user', content: prompt}],
            max_tokens: 50,
        });
        const chosenAction: string = response.choices[0].message.content?.trim() || '';
        return availableActions.includes(chosenAction) ? chosenAction : availableActions[0];
    }

    private async performAction(action: string | null): Promise<UIState> {
        // The commented portion could have been "used" to perform the action
        // but here let me just simulate the state based on where we are.
        // const prompt = `
        //     Current UI State: ${this.currentState}
        //     Action Performed: ${action}
        //     Possible Actions: ${this.simulatedUI}
        //
        //     You have to choose from the list of possible actions and the current state. What is the new state after performing the action? Respond with the new UI state.
        //     `;
        // const response = await this.openai.chat.completions.create({
        //     model: 'gpt-4o-mini',
        //     messages:[ {role: 'user', content: prompt}],
        //     max_tokens: 50,
        // });
        // return <UIState>response.choices[0].message.content;

        if (this.currentState === 'Home Page' && action === 'Click Sign Up') {
            return 'Sign Up Page';
        } else if (this.currentState === 'Sign Up Page' && action === 'Submit') {
            return 'Account Created Page';
        } else if (this.currentState === 'Account Created Page' && action === 'Click Continue to Dashboard') {
            return 'Dashboard';
        }
        return this.currentState;
    }

    private async evaluateAction(previousState: UIState, action: Action, newState: UIState): Promise<number> {
        const prompt = `
            Task: ${this.taskDescription}
            Previous UI State: ${previousState}
            Action Performed: ${action}
            New UI State: ${newState}
            
            On a scale from -1 (very unhelpful) to 1 (very helpful), how useful was the action in helping you progress towards completing the task? Provide a single number as your response
            `;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages:[ {role: 'user', content: prompt}],
            max_tokens: 50,
        });
        return  parseFloat(<string>response.choices[0].message.content); // this is how to cast into the expected type.
    }

    private updateKnowledgeBase(state: UIState, action: Action, usefulness: number): void {
        // We can have a more sophisticated strategy, perhaps like an in-memory database.
        // Here I am just going to have a continuous array of experiences.
        this.knowledgeBase.push({ state, action, usefulness });
    }

    private getRelevantExperiences(currentState: UIState): ActionEvaluation[] {
        // Again not sophisticated at all.
        // What we could do is to query the knowledge base and then get the most similar queries
        // based on embeddings or some other similarity metric.
        return this.knowledgeBase
            .filter(exp => exp.state.includes(currentState) || currentState.includes(exp.state))
            .sort((a, b) => b.usefulness - a.usefulness)
            .slice(0, 5);
    }

    private isTaskComplete(): boolean {
        // For simplicity, we'll just check if we are on the dashboard or if we have performed 10 actions.
        // Tokens are not cheap :)
        return this.currentState === 'Dashboard' || this.actionHistory.length >= 10;
    }

}

const apiKey:string |undefined  = process.env.OPEN_AI_KEY;
if (!apiKey) {
    console.error('No api key provided');
    process.exit(1);
}

const openai = new OpenAI({apiKey: apiKey});
const navigator = new SelfImprovingUINavigator(openai,
    'Home Page',
    'Complete the sign-up flow'
);

navigator.navigate().then(() => {
    console.log('Navigation completed');
}).catch((err) => {
    console.error('Error navigating:', err);
});