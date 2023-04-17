function processCopy() {
    let input = document.getElementById('link');
    navigator.clipboard.writeText(input.value);
}