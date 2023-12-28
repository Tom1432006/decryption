class Change{
    constructor(change, score){
        this.changeString = change;
        this.score = score;
    }
}

class Substitution{
    letters = [..."ABCDEFGHIJKLNMOPQRSTUVWXYZ"];
    letters_frequency = [..."ENISRATDHULCGMOBWFKZPVJYXQ"];
    letter_count = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    text = "";
    translated_text = "";

    notUsedLetters = [];

    words = [];
    biagramme = [];

    constructor(text){
        this.text = text.toUpperCase();
        this.loadBiagramms("deutsch");
        this.calculate();
    }

    calculate(){
        this.countLetters();
        this.translate();
    }

    /**
     * return the result as a html string to put into the #results div
     * @returns string html result
     */
    printResult(solving=false){
        let res = "<div class='decryption_result'><div class='amounts'>";

        for(let i = 0; i<26; i++){
            let percent_length = (this.letter_count[i]/this.sum(this.letter_count))*500;
            res += "<div class='amount'><p class='letter'>" +
            this.letters[i] + ":</p><p class='amount_bar'style='width: " + percent_length + "px'>" + this.letter_count[i] + "</p><p class='translate_to'>-> " +
            this.letters_frequency[i] + "</p></div>";
        }
        
        res += "</div><div class='text'><p class='score'>Score: " + this.scoreText(this.translated_text) + "</p><p>" + this.translated_text + "</p></div>";
        if(solving) res += "<div id='solving_message'>Automatisch Lösen</div>";
        res += "</div>";
        return res;
    }

    /**
     * count how much a letter occours in the text and store the result in the letter count array
     */
    countLetters(){
        for(let i = 0; i < this.text.length; i++){
            let index = this.text.charAt(i).charCodeAt(0)-65;
            this.letter_count[index]++;
        }
        this.sortLetters();
        this.filterNotUsedLetters();
    }

    /**
     * sort the letters by how much they are appearing
     * the most frequent letter is at the first index
     * algorithm: bubble sort
     */
    sortLetters(){
        for(let j = 0; j<25; j++){
            for(let i = 0; i<25-j;i++){
                if(this.letter_count[i] < this.letter_count[i+1]){
                    // tauschen
                    let count_hilf = this.letter_count[i];
                    let letter_hilf = this.letters[i];
                    
                    this.letter_count[i] = this.letter_count[i+1];
                    this.letters[i] = this.letters[i+1];
                    
                    this.letter_count[i+1] = count_hilf;
                    this.letters[i+1] = letter_hilf;
                }
            }
        }
    }

    /**
     * translate the text letter by letter with the given key
     */
    translate(){
        var text_split = [...this.text];
        for(let i = 0; i<text_split.length; i++){
            if(text_split[i].charCodeAt(0) < 64 || text_split[i].charCodeAt(0) > 90) continue;
            let index = this.findIndex(this.letters, text_split[i]);
            text_split[i] = this.letters_frequency[index];
        }
        this.translated_text = text_split.join("");
    }

    /**
     * swap to letters in the key and translate the text with that new key
     * @param {string} from lettter
     * @param {string} to letter
     */
    change(from, to){
        let fromindex = this.findIndex(this.letters_frequency, from);
        let toindex = this.findIndex(this.letters_frequency, to);

        let hilf = this.letters_frequency[fromindex];
        this.letters_frequency[fromindex] = this.letters_frequency[toindex];
        this.letters_frequency[toindex] = hilf;

        this.translate();
    }


    /**
     * copy the current key to the clipboard
     * the copying is done in the main.js file
     * @returns string
     */
    copyKey(){
        return this.letters_frequency.join(", ");
    }

    /**
     * import a key to decode the text with
     * @param {string} key 
     */
    importKey(key){
        this.letters_frequency = key.split(", ");
        this.translate();
    }

    solveText(changes_allowed, depth){
        for(var i = 0; i < changes_allowed; i++){
            let change = this.findChange(depth, true);
            if(change.changeString == "") return; // the algorithm cannot find a better solution
            console.log("changing: " + change.changeString);
            this.change(change.changeString.charAt(0), change.changeString.charAt(1));
        }
    }

    /**
     * find the best change to make
     * look some moves into the future, to find the best possible change,
     * like a little mini max search
     * @returns string change
     */
    alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]; 
    findChange(depth, first){
        let bestChange = new Change("", this.scoreText(this.translated_text));
        
        // stop wasting time on bad changes
        if(depth == 0 || bestChange.score < 45 && !first){
            return bestChange;
        }

        var checked = [];

        for (const letter1 of this.alphabet) {
            for (const letter2 of this.alphabet) {
                if(letter1 == letter2 || checked.includes(letter2 + letter1)) continue;
                
                this.change(letter1, letter2);
                let newChange = this.findChange(depth-1, false);
                // change back
                this.change(letter1, letter2);

                checked.push(newChange.changeString);

                if(newChange.score > bestChange.score){
                    bestChange = new Change(letter1 + letter2, newChange.score);
                }

            }
        }

        return bestChange;
    }

    /**
     * score the text by adding the propabilitys of all the biaramms together
     * and devide the text by its length, to always have the same magnitude regardless
     * the texts length
     * @param {string} text text to score
     * @returns double score
     */
    scoreText(text){
        let score = 0;

        for(var i = 0; i<text.length-1; i++){
            if(text.charCodeAt(i) < 65 || text.charCodeAt(i) > 90 || text.charCodeAt(i+1) < 65 || text.charCodeAt(i+1) > 90) continue;
            score += Number(this.biagramme[text.charCodeAt(i)-65][text.charCodeAt(i+1)-65]);
        }

        return score/text.length;
    }

    filterNotUsedLetters(){
        for(var i = 0; i < 26; i++){
            if(this.letter_count[i] == 0){
                this.notUsedLetters.push(this.letters[i]);
            }
        }
    }

    loadBiagramms(language){
        var bigram = [];
        $.ajax({
            url: 'biagramme/' + language + '.txt',
            type: 'get',
            async: false,
            success: function(text) {
                bigram = text.split("\r\n").map(function(el){ return el.split(" ");});
            }
        });
        this.biagramme = bigram;
    }

    /**
     * load the words from the language from the file and store them in the array
     * @param {string} language
     */
    loadWords(language){
        var words_split = [];
        $.ajax({
            url: 'words/' + language + '.txt',
            type: 'get',
            async: false,
            success: function(text) {
                words_split = text.split("\r\n");
            }
        });

        let longestWordLength = this.findLongestWord(words_split);
        for(var i = 0; i<longestWordLength;i++) this.words.push([]);

        // sort the words by its length
        for (const word of words_split) {
            this.words[word.length-1].push(word);
        }
    }

    /**
     * find the length of the longest word in the array
     * @param {array} arr 
     * @returns int
     */
    findLongestWord(arr){
        let longest = 0;
        for (const word of arr) {
            if(word.length > longest) longest = word.length;
        }
        return longest;
    }

    /**
     * sum an array of integers
     * @param {array} arr 
     * @returns int
     */
    sum(arr){
        let res = 0;
        for(let i = 0; i<arr.length; i++){
            res += arr[i];
        }
        return res;
    }

    /**
     * find the first index where the array has a specific value
     * @param {array} arr arr
     * @param {any} val val
     * @returns int
     */
    findIndex(arr, val){
        // linear search is here ok, because I only search the letters array
        for(let i = 0; i<arr.length;i++){
            if(arr[i] == val) return i;
        }
        return undefined;
    }
}