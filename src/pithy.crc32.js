/*!
pithy.crc32.js
crc32
by anlige @ 2017-07-28
*/

;(function(){
	var Crc32Table=[], map_hex2 = [];
	function MakeTable()
	{
	    var i,j,crc;
	    for (i = 0; i < 256; i++)
	    {
	        crc = i;
	        for (j = 0; j < 8; j++)
	        {
	            if (crc & 1)
	                crc = (crc >>> 1) ^ 0xEDB88320;
	            else
	                crc >>>= 1;
	        }
	        Crc32Table[i] = crc;
	        map_hex2.push(('0' + i.toString(16)).substr(-2));
	    }
	}
	function __initlize(csData)
	{
		if(!csData){
			return '';
		}
	    var crc  = 0xffffffff, len = csData.length, i=0;
	    var chr = 0;
	    for(var i = 0; i < len; i++)
	    {
			chr = csData.charCodeAt(i);
			if(chr <= 0xff){
		    	crc = (crc >>> 8) ^ Crc32Table[(crc ^ chr) & 0xff ];
	    	}else{
		    	crc = (crc >>> 8) ^ Crc32Table[(crc ^ ((chr >>> 2) & 0xff)) & 0xff ];
		    	crc = (crc >>> 8) ^ Crc32Table[(crc ^ (chr & 0xff)) & 0xff ];
	    	}
	    }
	    return word2hex(crc ^ 0xffffffff);
	}
	function word2hex(word){
		return map_hex2[word>>>24] + 
		map_hex2[(word>>16) & 0xff] + 
		map_hex2[(word>>8) & 0xff] + 
		map_hex2[word & 0xff];
	}
	MakeTable();
	
	window.Crc32 = __initlize;
})();