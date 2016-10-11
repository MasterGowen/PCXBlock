# -*- coding: utf-8 -*-

import datetime
import pkg_resources
import random
import json
import pytz
import datetime
import pkg_resources
import copy
import sys
import cv2
import base64
import numpy as np


from django.template import Context, Template
from django.utils.encoding import smart_text

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String, JSONField, Boolean
from xblock.fragment import Fragment

from xmodule.util.duedate import get_extended_due_date
from webob.response import Response

import defaults
from utils import *


class PCXBlock(XBlock):
    pics = JSONField(
        display_name=u"Картинки",
        help=u"Картинки",
        default=defaults.default,
        scope=Scope.settings
    )
   
    display_name = String(
        display_name=u"Название",
        help=u"Название задания, которое увидят студенты.",
        default=u'Compare images',
        scope=Scope.settings
    )

    question = String(
        # TODO: list
        display_name=u"Вопрос",
        help=u"Текст задания.",
        default=u"Изобразите на чертеже...",
        scope=Scope.settings
    )

    weight = Integer(
        display_name=u"Максимальное количество баллов",
        help=(u"Максимальное количество баллов",
              u"которое может получить студент."),
        default=10,
        scope=Scope.settings
    )

    #TODO: 1!
    max_attempts = Integer(
        display_name=u"Максимальное количество попыток",
        help=u"",
        default=1,
        scope=Scope.settings
    )

    attempts = Integer(
        display_name=u"Количество сделанных попыток",
        default=0,
        scope=Scope.user_state
    )

    points = Integer(
        display_name=u"Текущее количество баллов студента",
        default=None,
        scope=Scope.user_state
    )

    editor_settings = JSONField(
        display_name=u"Настройки редактора",
        help=u"Настройки редактора",
        default={
            "grid_step": "10"
        },
        scope=Scope.settings
    )
    
    background_image = String(
        # TODO: list
        display_name=u"Подложенная картинка",
        default=defaults.background_default,
        scope=Scope.settings
    )

    student_picture = String(
        display_name=u"Картинка студента",
        default="",    
        scope=Scope.user_state
    )

    correct_picture = String(
        # TODO: list
        display_name=u"Правильная картинка",
        default=defaults.correct_default,
        scope=Scope.settings
    )

    lines_settings = JSONField(
        display_name=u"Настройки проверки",
        help=u"Настройки проверки",
        default={
            "main_line": {"thickness": 20, "coefficient": 1},
            "dashed_line": {"thickness": 20, "coefficient": 1},
            "dash_dot_line": {"thickness": 20, "coefficient": 1},
            "thin_line": {"thickness": 20, "coefficient": 1},
        },
        scope=Scope.settings
    )

    links_settings = JSONField(
        display_name=u"Настройки привязок",
        help=u"Настройки привязок",
        default={"thickness": 20, "coefficient": 1},
        scope=Scope.settings
    )


    """
    link: gray (125, 125, 125)
    """
    links_color = JSONField(
        display_name=u"Настройки цвета привязок",
        help=u"Настройки цвета привязок",
        default={"min_color": [100, 100, 100], "max_color": [150, 150, 150]},
        scope=Scope.settings
    )   


    """
    main line: green
    dash dot line: red
    dashed line: blue
    thin line: black
    """
    all_lines = JSONField(
        display_name=u"Настройки цветов линий",
        help=u"Настройки цветов линий",
        default={
            "main_line": {"min_color": [0, 200, 0], "max_color": [200, 255, 200]},
            "dash_dot_line": {"min_color": [0, 0, 200], "max_color": [200, 200, 255]},
            "dashed_line": {"min_color": [200, 0, 0], "max_color": [255, 200, 200]},
            "thin_line": {"min_color": [0, 0, 0], "max_color": [100, 100, 100]},
        },
        scope=Scope.settings
    )    

    has_score = True

    @staticmethod
    def resource_string(path):
        """
        Handy helper for getting resources from our kit.
        """
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    @staticmethod
    def load_resources(js_urls, css_urls, fragment):
        """
        Загрузка локальных статических ресурсов.
        """
        for js_url in js_urls:

            if js_url.startswith('public/'):
                fragment.add_javascript_url(self.runtime.local_resource_url(self, js_url))
            elif js_url.startswith('static/'):
                fragment.add_javascript(_resource(js_url))
            else:
                pass

        for css_url in css_urls:

            if css_url.startswith('public/'):
                fragment.add_css_url(self.runtime.local_resource_url(self, css_url))
            elif css_url.startswith('static/'):
                fragment.add_css(_resource(css_url))
            else:
                pass

    def past_due(self):
            """
            Проверка, истекла ли дата для выполнения задания.
            """
            due = get_extended_due_date(self)
            if due is not None:
                if _now() > due:
                    return False
            return True

    def is_course_staff(self):
        """
        Проверка, является ли пользователь автором курса.
        """
        return getattr(self.xmodule_runtime, 'user_is_staff', False)

    def is_instructor(self):
        """
        Проверка, является ли пользователь инструктором.
        """
        return self.xmodule_runtime.get_user_role() == 'instructor'

    # views


    def studio_view(self, *args, **kwargs):
        """
        Отображение pcxblock разработчику (CMS).
        """

        context = {
            "display_name": self.display_name,
            "weight": self.weight,
            "question": self.question,
            "max_attempts": self.max_attempts,
            "background_image": self.background_image,
            "grid_step": self.editor_settings["grid_step"],


            "pic_parallellink": self.runtime.local_resource_url(self, 'public/images/pic_parallellink.svg'),
            "pic_perpendicularlink": self.runtime.local_resource_url(self, 'public/images/pic_perpendicularlink.svg'),
            "pic_extremelink": self.runtime.local_resource_url(self, 'public/images/pic_extremelink.svg'),
            "pic_linepointlink": self.runtime.local_resource_url(self, 'public/images/pic_linepointlink.svg'),
            "pic_intersectionlink": self.runtime.local_resource_url(self, 'public/images/pic_intersectionlink.svg'),
            "pic_circletool": self.runtime.local_resource_url(self, 'public/images/pic_circletool.svg'),
            "pic_smoothtool": self.runtime.local_resource_url(self, 'public/images/pic_smoothtool.svg'),
            "pic_arctool": self.runtime.local_resource_url(self, 'public/images/pic_arctool.svg'),

            "pic_grid_point": self.runtime.local_resource_url(self, 'public/images/pic_grid_point.svg'),
            "pic_point": self.runtime.local_resource_url(self, 'public/images/pic_point.svg'),
            "pic_ruler": self.runtime.local_resource_url(self, 'public/images/pic_ruler.svg'),
            "pic_delete": self.runtime.local_resource_url(self, 'public/images/pic_delete.svg'),

            "pic_back": self.runtime.local_resource_url(self, 'public/images/pic_back.svg'),
            "pic_bent": self.runtime.local_resource_url(self, 'public/images/pic_bent.svg'),
            "pic_line": self.runtime.local_resource_url(self, 'public/images/pic_line.svg'),
            "pic_rect": self.runtime.local_resource_url(self, 'public/images/pic_rect.svg'),
            "pic_BezierCurve": self.runtime.local_resource_url(self, 'public/images/pic_BezierCurve.svg'),
            "pic_eraser": self.runtime.local_resource_url(self, 'public/images/pic_eraser.svg'),
            "pic_grid": self.runtime.local_resource_url(self, 'public/images/pic_grid.svg'),   

            "pic_main_line": self.runtime.local_resource_url(self, 'public/images/pic_main_line.svg'),  
            "pic_dash_dot_line": self.runtime.local_resource_url(self, 'public/images/pic_dash_dot_line.svg'),  
            "pic_dashed_line": self.runtime.local_resource_url(self, 'public/images/pic_dashed_line.svg'),  
            "pic_thin_line": self.runtime.local_resource_url(self, 'public/images/pic_thin_line.svg'),  


            "main_line_thickness": self.lines_settings["main_line"]["thickness"],
            "main_line_coefficient": self.lines_settings["main_line"]["coefficient"],
            "dashed_line_thickness": self.lines_settings["dashed_line"]["thickness"],
            "dashed_line_coefficient": self.lines_settings["dashed_line"]["coefficient"],
            "dash_dot_line_thickness": self.lines_settings["dash_dot_line"]["thickness"],
            "dash_dot_line_coefficient": self.lines_settings["dash_dot_line"]["coefficient"],
            "thin_line_thickness": self.lines_settings["thin_line"]["thickness"],
            "thin_line_coefficient": self.lines_settings["thin_line"]["coefficient"],

            "link_thickness": self.links_settings["thickness"],
            "link_coefficient": self.links_settings["coefficient"],
        }

        fragment = Fragment()
        fragment.add_content(
            render_template(
                'static/html/pcxblock_edit.html',
                context
            )
        )

        js_urls = (
            'static/js/js/guid.js',
            'static/js/Utils/Pnt.js',
            'static/js/Utils/caman.full.js',
            'static/js/World.js',
            'static/js/Behaviours/Behaviour.js',
            'static/js/Drawers/Drawer.js',
            'static/js/Drawers/Drawer2D.js',           
            'static/js/js/jscolor.js',
            'static/js/Utils/Wheel.js',
            'static/js/Utils/FindCycles.js',
            'static/js/Utils/NumberFormat.js',
            'static/js/Utils/Wall.js',  
            'static/js/Utils/BezierCurve.js',
            'static/js/Utils/LinkPoint.js',
            'static/js/Utils/SmoothCurve.js',
            'static/js/Utils/Arc.js',
            'static/js/Crafters/Crafter.js',
            'static/js/Crafters/SimpleCrafter.js',
            'static/js/Crafters/Move2DCrafter.js',
            'static/js/Crafters/WallCrafter.js',
            'static/js/Utils/jquery-ui.min.js',
            'static/js/Utils/bootstrap.min.js',
            
            'static/js/utils.js',
            'static/js/graphics.js',
            'static/js/pcxblock_edit.js',
        )

        css_urls = (
            'static/css/pcxblock_studio.css',
            'static/css/designer.css',
            'static/css/font.css',
        )


        self.load_resources(js_urls, css_urls, fragment)
        fragment.initialize_js('PCXBlockEdit', {'grid_step': self.editor_settings["grid_step"], 'correct_picture': self.correct_picture})
        
        return fragment

    def student_view(self, *args, **kwargs):
        """
        Отображение PCXBlock студенту (LMS).
        """

        if student_id(self) != "student":
            context = {
                "points": self.points,
                "display_name": self.display_name,
                "weight": self.weight,
                "question": self.question,
                "attempts": self.attempts,
                "background_image": self.background_image,
                "empty_image":defaults.empty_image,
                "grid_step": self.editor_settings["grid_step"],
            
                "pic_parallellink": self.runtime.local_resource_url(self, 'public/images/pic_parallellink.svg'),
                "pic_perpendicularlink": self.runtime.local_resource_url(self, 'public/images/pic_perpendicularlink.svg'),
                "pic_extremelink": self.runtime.local_resource_url(self, 'public/images/pic_extremelink.svg'),
                "pic_linepointlink": self.runtime.local_resource_url(self, 'public/images/pic_linepointlink.svg'),
                "pic_intersectionlink": self.runtime.local_resource_url(self, 'public/images/pic_intersectionlink.svg'),
                "pic_circletool": self.runtime.local_resource_url(self, 'public/images/pic_circletool.svg'),
                "pic_smoothtool": self.runtime.local_resource_url(self, 'public/images/pic_smoothtool.svg'),
                "pic_arctool": self.runtime.local_resource_url(self, 'public/images/pic_arctool.svg'),
                "pic_back": self.runtime.local_resource_url(self, 'public/images/pic_back.svg'),
                "pic_bent": self.runtime.local_resource_url(self, 'public/images/pic_bent.svg'),
                "pic_line": self.runtime.local_resource_url(self, 'public/images/pic_line.svg'),
                "pic_rect": self.runtime.local_resource_url(self, 'public/images/pic_rect.svg'),

                "pic_grid_point": self.runtime.local_resource_url(self, 'public/images/pic_grid_point.svg'),
                "pic_point": self.runtime.local_resource_url(self, 'public/images/pic_point.svg'),
                "pic_ruler": self.runtime.local_resource_url(self, 'public/images/pic_ruler.svg'),
                "pic_delete": self.runtime.local_resource_url(self, 'public/images/pic_delete.svg'),

                "pic_BezierCurve": self.runtime.local_resource_url(self, 'public/images/pic_BezierCurve.svg'),
                "pic_eraser": self.runtime.local_resource_url(self, 'public/images/pic_eraser.svg'),
                "pic_draggable_handler": self.runtime.local_resource_url(self, 'public/images/pic_draggable_handler.svg'),
                "pic_grid": self.runtime.local_resource_url(self, 'public/images/pic_grid.svg'),
                "pic_main_line": self.runtime.local_resource_url(self, 'public/images/pic_main_line.svg'),  
                "pic_dash_dot_line": self.runtime.local_resource_url(self, 'public/images/pic_dash_dot_line.svg'),  
                "pic_dashed_line": self.runtime.local_resource_url(self, 'public/images/pic_dashed_line.svg'),  
                "pic_thin_line": self.runtime.local_resource_url(self, 'public/images/pic_thin_line.svg'),  


                "main_line": defaults.default["main_line"],
                "dash_dot_line": defaults.default["dash_dot_line"],
                "dashed_line": defaults.default["dashed_line"],
                "thin_line": defaults.default["thin_line"],
            }


            #if(student_id)
            if self.max_attempts != 0:
                context["max_attempts"] = self.max_attempts

            if self.past_due():
                context["past_due"] = True

            if answer_opportunity(self):
                context["answer_opportunity"] = True

            if self.is_course_staff() is True or self.is_instructor() is True:
                context['is_course_staff'] = True

            fragment = Fragment()
            fragment.add_content(
                render_template(
                    'static/html/pcxblock.html',
                    context
                )
            )

            js_urls = (
                'static/js/js/guid.js',
                'static/js/Utils/Pnt.js',
                'static/js/Utils/caman.full.js',
                'static/js/World.js',
                'static/js/Behaviours/Behaviour.js',
                'static/js/Drawers/Drawer.js',
                'static/js/Drawers/Drawer2D.js',           
                'static/js/js/jscolor.js',
                'static/js/Utils/Wheel.js',
                'static/js/Utils/FindCycles.js',
                'static/js/Utils/NumberFormat.js',
                'static/js/Utils/Wall.js',  
                'static/js/Utils/BezierCurve.js',
                'static/js/Utils/LinkPoint.js',
                'static/js/Utils/SmoothCurve.js',
                'static/js/Utils/Arc.js',
                'static/js/Crafters/Crafter.js',
                'static/js/Crafters/SimpleCrafter.js',
                'static/js/Crafters/Move2DCrafter.js',
                'static/js/Crafters/WallCrafter.js',
                'static/js/Utils/jquery-ui.min.js',
                'static/js/Utils/bootstrap.min.js',
                
                'static/js/utils.js',
                'static/js/graphics.js',
                'static/js/pcxblock.js',
                'static/js/jquery-ui.min.js',
            )

            css_urls = (
                'static/css/pcxblock.css',
                'static/css/designer.css',
                'static/css/font.css',
            )

            self.load_resources(js_urls, css_urls, fragment)
        else:
            context = {
                "background_image": self.background_image,
                "correct_picture": self.correct_picture
            }

            fragment = Fragment()
            fragment.add_content(
                render_template(
                    'static/html/pcxblock_studio.html',
                    context
                )
            )
            js_urls = (
                "static/js/pcxblock_studio.js",
            )

            css_urls = (
                'static/css/pcxblock_studio.css',
            )

            self.load_resources(js_urls, css_urls, fragment)

        fragment.initialize_js('PCXBlock', {'grid_step': self.editor_settings["grid_step"]})
        return fragment

    # handlers
    @XBlock.json_handler
    def get_settings(self, data, suffix=''):

        return json.dumps(self.editor_settings)

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        self.display_name = data.get('display_name')
        self.question = data.get('question')
        self.weight = data.get('weight')
        self.max_attempts = data.get('max_attempts')
        self.editor_settings["grid_step"] = data.get('grid_step')
        self.correct_picture = data.get('correct_picture')

        self.lines_settings["main_line"]["thickness"] = int(data.get('main_line_thickness'))
        self.lines_settings["main_line"]["coefficient"] = int(data.get('main_line_coefficient'))
        self.lines_settings["dashed_line"]["thickness"] = int(data.get('dashed_line_thickness'))
        self.lines_settings["dashed_line"]["coefficient"] = int(data.get('dashed_line_coefficient'))
        self.lines_settings["dash_dot_line"]["thickness"] = int(data.get('dash_dot_line_thickness'))
        self.lines_settings["dash_dot_line"]["coefficient"] = int(data.get('dash_dot_line_coefficient'))
        self.lines_settings["thin_line"]["thickness"] = int(data.get('thin_line_thickness'))
        self.lines_settings["thin_line"]["coefficient"] = int(data.get('thin_line_coefficient'))
        
        self.links_settings["thickness"] = int(data.get('link_thickness'))
        self.links_settings["coefficient"] = int(data.get('link_coefficient'))
              
              
        if data.get('background_image') == "":
            self.background_image = defaults.empty_image
        else:
            self.background_image = data.get('background_image')

        return {'result': 'success'}

    @XBlock.json_handler
    def student_submit(self, data, suffix=''):
               
        def get_student_picture(data):
            self.student_picture = data["picture"]
            student_picture_base64 = data["picture"]       
            return student_picture_base64

        @check_method
        def check_answer(student_image, correct_image):
            student_image = base64_to_image(student_image)
            correct_image = base64_to_image(correct_image)
            used_lines = detect_used_lines_types(correct_image, self.all_lines)
            sum = 0

            print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!', normalize_coefficients([self.lines_settings[k]["coefficient"] for k in self.lines_settings.keys()]))

            for key in used_lines:
                image_current_lines_correct = isolate_color(correct_image, self.all_lines[key]['min_color'], self.all_lines[key]['max_color'])
                image_current_lines_student = isolate_color(student_image, self.all_lines[key]['min_color'], self.all_lines[key]['max_color'])
                points = pixel_method(image_current_lines_student, image_current_lines_correct, self.lines_settings[key]["thickness"])
                print("Used ", key, '  :', 'image_current_lines_student  ', image_current_lines_student)
                sum = sum + points
                print("Points for line type: ", points)
            points = sum/len(used_lines)
            return points


        grade_global = check_answer(get_student_picture(data), self.correct_picture)
        self.points = grade_global
        self.points = grade_global * self.weight / 100
        self.points = int(round(self.points))
        self.attempts += 1
        self.runtime.publish(self, 'grade', {
            'value': self.points,
            'max_value': self.weight,
        })
        res = {"success_status": 'ok', "points": self.points, "weight": self.weight, "attempts": self.attempts, "max_attempts": self.max_attempts}
        return res

def answer_opportunity(self):
    """
    Возможность ответа (если количество сделанных попыток меньше заданного).
    """
    if self.max_attempts <= self.attempts and self.max_attempts != 0:
        return False
    else:
        return True


def _now():
    """
    Получение текущих даты и времени.
    """
    return datetime.datetime.utcnow().replace(tzinfo=pytz.utc)


def _resource(path):  # pragma: NO COVER
    """
    Handy helper for getting resources from our kit.
    """
    data = pkg_resources.resource_string(__name__, path)
    return data.decode("utf8")


def render_template(template_path, context=None):
    """
    Evaluate a template by resource path, applying the provided context.
    """
    if context is None:
        context = {}

    template_str = load_resource(template_path)
    template = Template(template_str)
    return template.render(Context(context))


def student_id(self):
    return self.xmodule_runtime.anonymous_student_id


def load_resource(resource_path):
    """
    Gets the content of a resource
    """
    try:
        resource_content = pkg_resources.resource_string(__name__, resource_path)
        return smart_text(resource_content)
    except EnvironmentError:
        pass
