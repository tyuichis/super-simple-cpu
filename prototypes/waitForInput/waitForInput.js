const input = document.getElementById('input');
const output = document.getElementById('output');
const submit = document.getElementById('submit')
const awaitInputButton = document.getElementById('ask-for-input');
const awaitInputTooltip = document.getElementById('await-input');



awaitInputButton.addEventListener('click', async () => {
    // remove the readonly attribute
    input.readOnly = false;

    awaitInputTooltip.classList.remove('hidden');

    const userInput = await getUserInput();
    output.value = userInput; 

    //re-add readonly
    input.readOnly = true;
})

async function getUserInput() {
    return new Promise((resolve) => {
        // wait for the user to hit submit
        submit.addEventListener('click', _ => {
            awaitInputTooltip.classList.add('hidden');
            resolve(input.value);
        }, {once: true}) 
    })
}