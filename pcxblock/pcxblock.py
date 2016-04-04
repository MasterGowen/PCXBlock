# -*- coding: utf-8 -*-

import datetime
import pkg_resources
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
from utils import check_method, pixels_count, base64_to_image, thresh_callback


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
        default=u'Compare pics',
        scope=Scope.settings
    )

    question = String(
        display_name=u"Вопрос",
        help=u"Текст задания.",
        default=u"Вы готовы, дети?",
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
        default=100,
        scope=Scope.settings
    )

    attempts = Integer(
        display_name=u"Количество сделанных попыток",
        default=0,
        scope=Scope.user_state
    )

    points = Integer(
        display_name=u"Количество баллов студента",
        default=None,
        scope=Scope.user_state
    )

    grading_threshold = Integer(
        display_name=u"Количество баллов студента",
        default=None,
        scope=Scope.settings
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
        display_name=u"Правильная картинка",
        default=defaults.correct_default,
        scope=Scope.settings
    )

    thickness_for_contour = Integer(
        display_name=u"Ширина размытия",
        help=u"",
        default=25,
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
            "thickness_for_contour": self.thickness_for_contour,

            "pic_back": self.runtime.local_resource_url(self, 'public/images/pic_back.svg'),
            "pic_bent": self.runtime.local_resource_url(self, 'public/images/pic_bent.svg'),
            "pic_line": self.runtime.local_resource_url(self, 'public/images/pic_line.svg'),
            "pic_rect": self.runtime.local_resource_url(self, 'public/images/pic_rect.svg'),
            "pic_BezierCurve": self.runtime.local_resource_url(self, 'public/images/pic_BezierCurve.svg'),
            "pic_eraser": self.runtime.local_resource_url(self, 'public/images/pic_eraser.svg'),
            "pic_grid": self.runtime.local_resource_url(self, 'public/images/pic_grid.svg'),
            
            "main_line": defaults.default["main_line"],
            "dash_dot_line": defaults.default["dash_dot_line"],
            "dashed_line": defaults.default["dashed_line"],
            "thin_line": defaults.default["thin_line"],
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
            
                "pic_back": self.runtime.local_resource_url(self, 'public/images/pic_back.svg'),
                "pic_bent": self.runtime.local_resource_url(self, 'public/images/pic_bent.svg'),
                "pic_line": self.runtime.local_resource_url(self, 'public/images/pic_line.svg'),
                "pic_rect": self.runtime.local_resource_url(self, 'public/images/pic_rect.svg'),
                "pic_BezierCurve": self.runtime.local_resource_url(self, 'public/images/pic_BezierCurve.svg'),
                "pic_eraser": self.runtime.local_resource_url(self, 'public/images/pic_eraser.svg'),
                "pic_draggable_handler": self.runtime.local_resource_url(self, 'public/images/pic_draggable_handler.svg'),
                "pic_grid": self.runtime.local_resource_url(self, 'public/images/pic_grid.svg'),

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
        self.thickness_for_contour = data.get('thickness_for_contour')

        if data.get('background_image') == "":
            self.background_image = defaults.empty_image
        else:
            self.background_image = data.get('background_image')

        return {'result': 'success'}

    @XBlock.json_handler
    def student_submit(self, data, suffix=''):
        
        def get_pictures(data):
            self.student_picture = data["picture"]
            student_picture_base64 = data["picture"]

            return student_picture_base64

        @check_method
        def pixel_method(student_picture_base64, correct_picture_base64, thickness):

            correct_image = base64_to_image(correct_picture_base64)
            student_image = base64_to_image(student_picture_base64)

            line_color_min = [0, 0, 0]
            line_color_max = [200, 200, 200]

            all_gray_student_pixels_count = pixels_count(student_image, line_color_min, line_color_max)
            all_gray_correct_pixels_count = pixels_count(correct_image, line_color_min, line_color_max)

            thickness_contour = thickness
            diff = thresh_callback(student_image, correct_image, thickness_contour, 0)
            diff1 = thresh_callback(correct_image, student_image, thickness_contour, 0)

            gray_wrong_pixels_count1 = pixels_count(diff1, line_color_min, line_color_max)
            gray_wrong_pixels_count = pixels_count(diff, line_color_min, line_color_max)

            if all_gray_student_pixels_count != 0:
                grade_first = float((all_gray_student_pixels_count - gray_wrong_pixels_count))/all_gray_student_pixels_count
                grade_first = grade_first

                grade_second = float((all_gray_correct_pixels_count - gray_wrong_pixels_count1))/all_gray_correct_pixels_count
                grade_second = grade_second

                grade_global = min(grade_first, grade_second) * max(grade_first, grade_second) * 100

            else:
                grade_global = 0

            return grade_global

        try:
            grade_global = pixel_method(get_pictures(data), self.correct_picture, self.thickness_for_contour)

            self.points = grade_global * self.weight / 100
            self.points = int(round(self.points))
            self.attempts += 1
        
            self.runtime.publish(self, 'grade', {
                'value': self.points,
                'max_value': self.weight,
            })
            res = {"success_status": 'ok', "points": self.points, "weight": self.weight, "attempts": self.attempts, "max_attempts": self.max_attempts}
        except:
            res = {"success_status": 'error'}
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
