class Viginere{
    text = "";
    key = "";
    key_numbers = [];
    translated_text = "";
    translated_text_with_spaces = "";

    possible_lengths = [];
    guesesd_length = 0;

    words = [];
    biagramme = [];

    constructor(text){
        this.text = text.toUpperCase().replace(" ", "");
        this.loadBiagramms("deutsch");
        this.loadWords("deutsch");
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
        var res = "<div id='viginere_result'>Score: " + this.scoreText(this.translated_text) + " -- Länge: " + this.guesesd_length + " -- Key: " + this.key + "<br>" + this.translated_text + "</div>";
        return res;
    }

    setKey(key){
        this.key = key.toUpperCase();
        this.keyToNumbers();
        this.translate();
    }

    /**
     * try to guess the key unsing brute force and save return the key with the best score
     * not use the guessed length from the kasiski test, because it is safer and not that much slower,
     * to brute force all
     * @returns key
     */
    guessKey(){
        var bestScore = 0;
        var bestKey = "";

        for(var j = 0; j<this.words.length;j++){
            for(var i = 0; i<this.words[j].length;i++){
                let key = this.words[j][i];
                this.setKey(key);
                
                var score = this.scoreText(this.translated_text);
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
        
        // get all the divisors of the numbers
        for(var i = 0; i<pattern_distances.length; i++){
            let divisorsTemp = this.getDivisors(pattern_distances[i]);
            if(divisorsTemp.length > 1){
                divisors.push(divisorsTemp);
            }
        }

        // find the divisors that are the same in every distance
        // go through the first divisors and check if they are in all others
        for(var i = 0; i<divisors[0].length; i++){
            var div = divisors[0][i];
            var occourance = 0;

            if(div < 3) continue;

            for(var j = 1; j < divisors.length; j++){
                if(divisors[j].includes(div)){
                    occourance++;
                }
            }

            if(occourance > most_occourances) {
                most_occourances = occourance;
                best_length = div;
            }
        }

        console.log(divisors);
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

        for(var length = 3; length <= 10; length++){
            for(var start = 0; start < text.length-length; start++){
                var pattern = text.substring(start, start+length);

                // find if pattern exists elsewhere
                for(var i = 0; i<text.length-length; i++){
                    if(start != i && text.substring(i, i+length) == pattern && !pattern_distance.includes(Math.abs(start-i))){
                        pattern_distance.push(Math.abs(start - i));
                    }         
                }
            }
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

        return score/100;
    }
    
    /**
     * load the biagramms from the given language and store it in an array
     * biagramme[index first letter][index second letter]
     * @param {string} language 
     */
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

}