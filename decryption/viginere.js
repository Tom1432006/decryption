class Viginere{
    // variables for the key calculating
    letters = [];
    letters_frequency = [..."ENISRATDHULCGMOBWFKZPVJYXQ"];
    letter_count = [];
    calculatedFrequencys = false;

    text = "";
    key = "";
    key_numbers = [];
    translated_text = "";
    translated_text_with_spaces = "";

    possible_lengths = [];
    guesesd_length = 0;

    words = [];
    score;

    constructor(text, language){
        this.text = text.toUpperCase().replace(" ", "");
        this.score = new Score(language);
        this.loadWords(language);
        this.loadAlphabet(language);
        this.setKey("a");
    }

    keyToNumbers(){
        this.key_numbers = [];
        for(var i = 0; i<this.key.length; i++){
            this.key_numbers.push(this.key.charCodeAt(i));
        }
    }

    translate(){
        this.translated_text = "";
        var key_number_counter = 0;
        for(var i = 0; i < this.text.length; i++){
            if(this.text.charCodeAt(i) < 64 || this.text.charCodeAt(i) > 90) {
                this.translated_text += this.text.charAt(i);
                continue;
            }

            var new_char_code = this.text.charCodeAt(i) - this.key_numbers[key_number_counter % this.key_numbers.length] + 65;
            if(new_char_code < 65) new_char_code += 26;
            this.translated_text += String.fromCharCode(new_char_code);
            key_number_counter++;
        }
    }

    printResult(){
        var res = "<div id='viginere_result'><div class='text'>Score: " + this.score.scoreText(this.translated_text) + " -- Länge: " + this.guesesd_length + " -- Key: " + this.key + "<br>" + this.translated_text + "</div>";

        // print the frequency for each letter in the key if they were calculated
        if(this.calculatedFrequencys){
            res += "<div class='amounts_wrapper'>";
            for(var n = 0; n<this.guesesd_length; n++){
                res += "<div class='amounts'><p>" + n + ":</p>";

                for(let i = 0; i<26; i++){
                    let percent_length = (this.letter_count[n][i]/this.sum(this.letter_count[n]))*500;
                    res += "<div class='amount'><p class='letter'>" +
                    this.letters[n][i] + ":</p><p class='amount_bar'style='width: " + percent_length + "px'>" + this.letter_count[n][i] + "</p></div>";
                }

                res += "</div>";
            }
            res += "</div>"
        }

        res += "</div>";
        return res;
    }

    setKey(key){
        this.key = key.toUpperCase();
        this.keyToNumbers();
        this.translate();
    }

    /**
     * try to calculate the key by first getting the length of the keyword and then perform a frequency analysis
     * with every character that gets decoded by the same letter in the key
     * @returns key from the generate function
     */
    calculateKey(){
        this.guessLength();
        this.countLetters();
        this.calculatedFrequencys = true;
        return this.generateKeyFromCountedLetters();
    }

    /**
     * Calculate the Key, by shifting the diffrent alphabets, so that it matches the letter with the highest frequency
     * from the given language.
     * It is a bit of a mess, but i hope my comments help
     * @returns key
     */
    generateKeyFromCountedLetters(){
        var key = "";
        
        // find the best shift for each letter in the key
        for(var i = 0; i<this.guesesd_length; i++){
            // shift the alphabet so, that the letter with the highest frequency matches the letter with the highest frequency of the language
            // find the key letter by subtracting the letter with the highest frequency of the given language from the letter with the highest frequency
            // in the text
            // get the ASCII code of the to letters
            var first_letter_ascii = this.letters[i][0].charCodeAt(0);
            var dest_letter_ascii = this.letters_frequency[0].charCodeAt(0);
            // subtract
            var key_letter = first_letter_ascii-dest_letter_ascii;
            if(key_letter < 0) key_letter += 26; // wrap back around
            key_letter += 65; // add 65 to convert it back to ASCII Code

            key += String.fromCharCode(key_letter);
        }

        // see, if the first letter was not the perfect one
        // that could be the case, if the frecuency of the 2nd most frequent letter is almost the same
        // see if any other letter, that has almost the same frequency, get's a better score than the one with the highest frequency
        // This way the last errors, where the theory above doesn't work, get filtered out
        for(var i = 0; i < this.guesesd_length; i++){
            this.setKey(key);
            var best_score = this.score.scoreText(this.translated_text);

            // go through the alphabet until the 
            for(var n = 1; n<26; n++){
                if(this.letter_count[i][0] - this.letter_count[i][n] < 5){
                    // shift the alphabet so, that the letter with the nth highest frequency matches the letter with the highest frequency of the language
                    // and check if the score is better with that
                    var first_letter_ascii = this.letters[i][n].charCodeAt(0);
                    var dest_letter_ascii = this.letters_frequency[0].charCodeAt(0);
                    var key_letter = first_letter_ascii-dest_letter_ascii;
                    if(key_letter < 0) key_letter += 26;
                    key_letter += 64; // only add 64 insted of 65 because i don't know. It works that way.
                    
                    // replace the new letter in the key
                    var letter_before = key.charAt(i); // save the letter it was before to change back if it was not better
                    key = key.replaceAt(i, String.fromCharCode(key_letter));
                    
                    // set the new key
                    this.setKey(key);
                    var score_after = this.score.scoreText(this.translated_text);
                    
                    // compare
                    if(score_after > best_score){
                        best_score = score_after;
                    }else{
                        // if it is not better, change back
                        key = key.replaceAt(i, letter_before);
                    }
                }else{break;} // stop if the letters frequency is 5 or more away, because they are sorted by frequency
            }
        }

        this.setKey(key);
        return key;
    }

    /**
     * count the letters for every place in the key
     * and sort them at the end by the highest number
     */
    countLetters(){
        // fill in the letter count array with empty arrays
        for(let i = 0; i < this.guesesd_length; i++){
            this.letter_count.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
            this.letters.push(['A','B','C','D','E','F','G','H','I','J','K','L','N','M','O','P','Q','R','S','T','U','V','W','X','Y','Z']);
        }


        // count the letters
        for(var j = 0; j < this.guesesd_length; j++){
            for(let i = j; i < this.text.length; i+=this.guesesd_length){
                let index = this.text.charAt(i).charCodeAt(0)-65;
                this.letter_count[j][index]++;
            }
        }

        // find the best shift for all the letters in the key, so that the frequency matches
        // the frequency of all the letters from the given language
        // sort the counted letters by the highest letter
        this.sortCountedLetters();
    }

    /**
     * sort all the counted letters for every letter in the key
     * sort using bubble sort, to not only sort the numbers, but also the letters
     * belonging to the numbers, which are stored in a diffrent array
     */
    sortCountedLetters(){
        for(let x = 0; x<this.letter_count.length; x++){
            var letters_c = this.letter_count[x];
            var letters_l = this.letters[x];

            for(let j = 0; j<25; j++){
                for(let i = 0; i<25-j;i++){
                    if(letters_c[i] < letters_c[i+1]){
                        // tauschen
                        let count_hilf = letters_c[i];
                        let letter_hilf = letters_l[i];
                        
                        letters_c[i] = letters_c[i+1];
                        letters_l[i] = letters_l[i+1];
                        
                        letters_c[i+1] = count_hilf;
                        letters_l[i+1] = letter_hilf;
                    }
                }
            }
        }
    }

    /**
     * try to guess the key unsing brute force and save return the key with the best score
     * not use the guessed length from the kasiski test, because it is safer, incase it is wrong and 
     * not that much slower, to brute force all
     * @returns key
     */
    guessKey(){
        var bestScore = 0; 
        var bestKey = "";

        for(var j = 0; j<this.words.length;j++){
            for(var i = 0; i<this.words[j].length;i++){
                let key = this.words[j][i];
                this.setKey(key);
                
                var score = this.score.scoreText(this.translated_text);
                if(score > bestScore){
                    bestScore = score;
                    bestKey = key;
                }
            }
        }
            
        this.setKey(bestKey);
        return bestKey;
    }

    /**
     * try to guess the length of the keyword using the Kasiski-Test
     * https://de.wikipedia.org/wiki/Kasiski-Test
     * @returns length
     */
    guessLength(){
        var divisors = [];
        var pattern_distances = this.findRepeatingPatterns();
        var most_occourances = 0;
        var best_length = 0;
        
        // get all the divisors of the distances that have been found
        // because the length of the key must be one of that
        for(var i = 0; i<pattern_distances.length; i++){
            let divisorsTemp = this.getDivisors(pattern_distances[i]);
            if(divisorsTemp.length > 1){
                divisors.push(divisorsTemp);
            }
        }

        // count the occourance of every possible length, to find the one, that occourse the most 
        // because that is the one, that is most likely to be the length of the key
        for(var i = 0; i<divisors[0].length; i++){
            var div = divisors[0][i];
            var occourance = 0;

            if(div < 3) continue; // keys under 3 are unrealistic and a key with the length 1 is just normal Ceasar Encryption

            // count
            for(var j = 1; j < divisors.length; j++){
                if(divisors[j].includes(div)){
                    occourance++;
                }
            }

            // save the best one if it has the most occourances so far
            if(occourance > most_occourances) {
                most_occourances = occourance;
                best_length = div;
            }
        }

        this.guesesd_length = best_length;
        return best_length;
    }

    /**
     *  to find repeating patterns first look for the first 3 if they occour in the text
     *  if not then check for the first 4 and so on, until maybe 10, and then move on to
     *  start on the second character and so on until a repeating patter has been found
     *  save the distance of the patterns to the pattern distance array, to guess the length
     *  of the keyword
     * @returns array of disances of the patterns
     */
    findRepeatingPatterns(){
        var pattern_distance = [];
        var text = this.text;

        for(var length = 15; length >= 3; length--){
            for(var start = 0; start < text.length-length; start++){
                var pattern = text.substring(start, start+length);

                // find if pattern exists elsewhere
                for(var i = 0; i<text.length-length; i++){
                    if(start != i && text.substring(i, i+length) == pattern && !pattern_distance.includes(Math.abs(start-i))){
                        pattern_distance.push(Math.abs(start - i));
                    }         
                }
            }

            // if there have been found more than 10 patterns break out of the loop,
            // because the longer the pattern is, the more not random it is and the results will be more accurate
            if(pattern_distance.length > 10) break;
        }

        return pattern_distance;
    }

    getDivisors(num){
        var div = [num];
        for(var i = 2; i<=Math.ceil(num/2); i++){
            if(num % i == 0) div.push(i);
        }
        return div;
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

    loadAlphabet(language){
        var letters = "";
        $.ajax({
            url: 'letters/' + language + '.txt',
            type: 'get',
            async: false,
            success: function(text) {
                letters = text;
            }
        });
        this.letters_frequency = [...letters];
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

}