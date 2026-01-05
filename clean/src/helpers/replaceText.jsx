export const replaceText = (text, replace) => {
    return text.replace("{item}", replace)
}

export const replaceTextPuzzle = (text, replace1, replace2) => {
    return text.replace("{item1}", replace1).replace("{item2}", replace2);
}
