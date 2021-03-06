(function($) {

	$.fn.jsonHighlight = function(json, collapse) {

		$('#debug_title').mousedown(function(eo){

			eo.preventDefault();
		});

		function highlight(json, collapse) {

			var $objectNode, objectHTML;

			try {
				objectHTML = FormatObject(SortObject(JSON.parse(json)));
			} catch(e) {
				objectHTML = 'JSON parse error. Raw JSON: ' + json;
				console.log(e);
			}

			$objectNode = $([
				'<div class="response_highlight light">',
					'<div class="rh_controls exp_controls">',
						'<div class="col_all_btn">Collapse all</div>',
						'<div class="exp_all_btn">Expand all</div>',
					'</div>',
					'<div class="rh_controls hl_controls">',
						'<div class="raw_btn">Raw</div>',
						'<div class="hl_btn">Highlighted</div>',
					'</div>',
					'<div class="rh_content">',
						'<div class="hl">' + objectHTML + '</div>',
						'<div class="raw hidden">' + json + '</div>',
					'</div>',
				'</div>']
			.join(''));

			addListeners($objectNode);

			if (collapse === true) {
			    collapseFirstLevel($objectNode);
			}

			return $objectNode;
		}

		function addListeners($node) {

			var $raw = $node.find('.raw'),
				$hl = $node.find('.hl');

			$node.find('.node_collapse').click( function() {

                var $t = $(this);

                if ($t.hasClass('collapsed')) {

                    //$t.text($t.text() + '...');
                    $t.removeClass('collapsed').addClass('expanded');
                    $t.next().show();

                } else if ($t.hasClass('expanded')) {

                    //$t.text($t.text().replace('...', ''));
                    $t.removeClass('expanded').addClass('collapsed');
                    $t.next().hide();
                }

            })
			.mousedown(stop);

			$node.find('.col_all_btn').click(function(e) {
                collapseAll($node);
            });

			$node.find('.exp_all_btn').click(function(e) {
                expandAll($node);
            });

			$node.find('.raw_btn').click(function(e) {
				$raw.removeClass('hidden');
				$hl.addClass('hidden');
			}).mousedown(stop);

			$node.find('.hl_btn').click(function(e) {
				$hl.removeClass('hidden');
				$raw.addClass('hidden');
			}).mousedown(stop);

		}

		function collapseFirstLevel($node) {
		    //$node.find('.hl > .response_node > .node_collapse').each(function(k, v) {
		    $node.find('.hl > .response_node > .response_node > .node_collapse').each(function(k, v) {
                var $t = $(this);

                //$t.text($t.text() + '...');
                $t.addClass('collapsed').removeClass('expanded');
                $t.next().hide();
            });
		}

		function collapseAll($node) {
		    $node.find('.hl > .response_node .node_collapse').each(function(k, v) {
                var $t = $(this);

                //$t.text($t.text() + '...');
                $t.addClass('collapsed').removeClass('expanded');
                $t.next().hide();
            });
		}

        function expandAll($node) {
		    $node.find('.hl > .response_node .node_collapse').each(function(k, v) {
                var $t = $(this);

                //$t.text($t.text().replace('...', ''));
                $t.addClass('expanded').removeClass('collapsed');
                $(this).next().show();
            });
		}


		function stop(e){
			e.preventDefault();
			e.stopPropagation();
		}

		function SortObject(oData) {
			var oNewData = {};
			var aSortArray = [];

			// sort keys
			$.each(oData, function(sKey) {
				aSortArray.push(sKey);
			});
			aSortArray.sort(SortLowerCase);

			// create new data object
			$.each(aSortArray, function(i) {
				if (RealTypeOf(oData[(aSortArray[i])]) == "object" ) {
					oData[(aSortArray[i])] = SortObject(oData[(aSortArray[i])]);
				}
				oNewData[(aSortArray[i])] = oData[(aSortArray[i])];
			});

			return oNewData;

			function SortLowerCase(a,b) {
				if (a.toLowerCase && b.toLowerCase) {
					a = a.toLowerCase();
					b = b.toLowerCase();
					return ((a < b) ? -1 : ((a > b) ? 1 : 0));
				}

				return 0;
			}
		}

		function RealTypeOf(v) {

			if (typeof(v) == "object") {

				if (v === null) { return "null"; }
				if (v.constructor == (new Array).constructor) { return "array"; }
                if (v.constructor == (new Date).constructor) { return "date"; }
                if (v.constructor == (new RegExp).constructor) { return "regex"; }

				return "object";
			}

			return typeof(v);
		}

		function FormatObject(oData, sIndent) {

			if (arguments.length < 2) {
				var sIndent = "";
			}
			var sIndentStyle = "    ";
			var sDataType = RealTypeOf(oData);

			// open object
			if (sDataType == "array") {

				if (oData.length === 0) {
					return "<span class='response_node_type'>Array</span> []";
				}
				var sHTML = [
					'<span class="response_node_type">Array</span> ',
					'<span class="node_collapse expanded" title="fold/unfold">[</span>',
					'<div class="response_node">'
				].join('');

			} else {

				var iCount = 0;
				$.each(oData, function() {
					iCount++;
					return;
				});
				if (iCount === 0) { // object is empty
					return "{}";
				}
				var sHTML = [
					'<span class="response_node_type">Object</span> ',
					'<span class="node_collapse expanded" title="fold/unfold">{</span>',
					'<div class="response_node">'
				].join('');

			}

			// loop through items
			var iCount = 0;
			$.each(oData, function(sKey, vValue) {

				if (iCount > 0) {
					sHTML += ", <br />";
				}
				if (sDataType == "array") {
					sHTML += ("\n" + sIndent + sIndentStyle);
				} else {
					sHTML += ("\n" + sIndent + sIndentStyle + "<span class='response_node_key'>\"" + sKey + "\"</span>" + ": ");
				}

				// display relevant data type
				switch (RealTypeOf(vValue)) {
					case "array":
					case "object":
						sHTML += FormatObject(vValue, (sIndent + sIndentStyle));
						break;
					case "boolean":
							sHTML += ("<span class='response_special1'>" + vValue + "</span>");
							break;
					case "number":
						sHTML += ("<span class='response_number'>" + vValue.toString() + "</span>");
						break;
					case "null":
						sHTML += "null";
						break;
					case "string":
						sHTML += ("<span class='response_node_val'>\"" + vValue + "\"</span>");
						break;
					default:
						sHTML += ("TYPEOF: " + typeof(vValue));
				}

				// loop
				iCount++;
			});

			// close object
			if (sDataType == "array") {
				sHTML += ("\n" + sIndent + "</div>]");
			} else {
				sHTML += ("\n" + sIndent + "</div>}");
			}

			// return
			return sHTML;
		}

		return highlight(json, collapse);
	};

})(jQuery);
