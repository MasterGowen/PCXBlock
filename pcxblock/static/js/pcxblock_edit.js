function PCXBlockEdit(runtime, element, data) {
 
    /*function success_func(result) {
       gridStep = JSON.parse(result).grid_step;
       console.log("Шаг сетки venm: " + gridStep);
    };
    
    $.ajax({
            type: "POST",
            url: runtime.handlerUrl(element, 'get_settings'),
            success: success_func,
            data: JSON.stringify({"task": "get_settings"})
    });
*/

	//var lol = data.grid_step;

	//console.log("lol: " + lol);
    
    if (window.World.Crafter.GridMode) {
            window.World.Drawer.SetStepGrid(data.grid_step);
        }

    $('#grid_step').change(function () {
        if (window.World.Crafter.GridMode) {
            window.World.Drawer.SetStepGrid($(this).val());
            }
    });

    $( "#workzone" ).mouseover(function() {
        $("body").css("overflow","hidden")    
    });

    $( "#workzone" ).mouseout(function() {
        $("body").css("overflow","auto");            
    });

    $(".modal-content").css("height", 1070);        
    $(".modal-content").css("overflow","hidden");


    function readFile() {
      if (this.files && this.files[0]) {
        var FR = new FileReader();
        FR.onload = function(e) {
          $(element).find('input[name=background_image]')[0].value = e.target.result;
        };

        FR.readAsDataURL(this.files[0]);
      }
    };
    $(element).find('input[name=upload_image]')[0].addEventListener("change", readFile, false);

    var tabList = '<li class="action-tabs is-active-tabs" id="main-settings-tab">Изображение</li><li class="action-tabs" id="scenario-settings-tab">Основные</li><li class="action-tabs" id="advanced-settings-tab">Расширенные</li>';
	document.getElementsByClassName("editor-modes action-list action-modes")[0].innerHTML = tabList;

	document.querySelector('#main-settings-tab').onclick = function(){
	  document.querySelector('#main-settings-tab').classList.add('is-active-tabs');
	  document.querySelector('#scenario-settings-tab').classList.remove('is-active-tabs');
	  document.querySelector('#advanced-settings-tab').classList.remove('is-active-tabs');

	  document.querySelector('#main-settings').removeAttribute('hidden');
      document.querySelector('#scenario-settings').setAttribute('hidden', 'true');
      document.querySelector('#advanced-settings').setAttribute('hidden', 'true');
	};

	document.querySelector('#scenario-settings-tab').onclick = function(){
	  document.querySelector('#main-settings-tab').classList.remove('is-active-tabs');
	  document.querySelector('#scenario-settings-tab').classList.add('is-active-tabs');
	  document.querySelector('#advanced-settings-tab').classList.remove('is-active-tabs');

	  document.querySelector('#main-settings').setAttribute('hidden', 'true');
      document.querySelector('#scenario-settings').removeAttribute('hidden');
      document.querySelector('#advanced-settings').setAttribute('hidden', 'true');
	};

	document.querySelector('#advanced-settings-tab').onclick = function(){
	  document.querySelector('#main-settings-tab').classList.remove('is-active-tabs');
	  document.querySelector('#scenario-settings-tab').classList.remove('is-active-tabs');
	  document.querySelector('#advanced-settings-tab').classList.add('is-active-tabs');

	  document.querySelector('#main-settings').setAttribute('hidden', 'true');
      document.querySelector('#scenario-settings').setAttribute('hidden', 'true');
      document.querySelector('#advanced-settings').removeAttribute('hidden');
	};

    $(element).find('.save-button').bind('click', function() {

       /* if (window.World.Crafter instanceof WallCrafter) window.World.Crafter.SetResultMode(true);
            window.World.Draw();
        $('.ge_gridMode').text("Убрать сетку");*/

        var res = drawResult();

        var handlerUrl = runtime.handlerUrl(element, 'studio_submit'),
            data = {
                display_name: $(element).find('input[name=display_name]').val(),
                question: $(element).find('textarea[name=question]').val(),
                weight: $(element).find('input[name=weight]').val(),
                max_attempts: $(element).find('input[name=max_attempts]').val(),
                background_image: $(element).find('input[name=background_image]').val(),
                grid_step: $(element).find('input[name=grid_step]').val(),
                correct_picture: res
            };

        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            window.location.reload(true);
        });
    });

    $(element).find('.cancel-button').bind('click', function() {
        runtime.notify('cancel', {});
    });
}