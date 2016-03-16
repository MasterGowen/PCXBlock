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


class PCXBlock(XBlock):
    pics = JSONField(
        display_name=u"Правильный ответ",
        help=u"Скрытое поле для правильного ответа в формате json.",
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
        default=u"Вы готовы?",
        scope=Scope.settings
    )

    weight = Integer(
        display_name=u"Максимальное количество баллов",
        help=(u"Максимальное количество баллов",
              u"которое может получить студент."),
        default=100,
        scope=Scope.settings
    )

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

    backgroung_picture = String(
        display_name=u"Подложенная картинка",
        default=defaults.background_default,
        scope=Scope.settings
    )

    student_picture = String(
        display_name=u"картинка студента",
        default="",	
        scope=Scope.user_state
    )

    correct_picture = String(
        display_name=u"правильная картинка",
        default=defaults.correct_default,
        scope=Scope.user_state
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
            "backgroung_picture": defaults.background_default,
            "pic_back": defaults.default["pic_back"],
            "pic_bent": defaults.default["pic_bent"],
            "pic_line": defaults.default["pic_line"],
            "pic_rect": defaults.default["pic_rect"],
            "pic_BezierCurve": defaults.default["pic_BezierCurve"],
            "pic_eraser": defaults.default["pic_eraser"],
            "pic_logo": defaults.default["pic_logo"],
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
            'static/js/graphics.js',
            'static/js/pcxblock_edit.js',
        )

        css_urls = (
            'static/css/pcxblock.css',
            'static/css/designer.css',
            'static/css/font.css',
        )

        self.load_resources(js_urls, css_urls, fragment)
        fragment.initialize_js('PCXBlockEdit')

        return fragment

    def student_view(self, *args, **kwargs):
        """
        Отображение PCXBlock студенту (LMS).
        """

        if student_id(self) != "student":
            context = {
                "display_name": self.display_name,
                "weight": self.weight,
                "question": self.question,
                "attempts": self.attempts,
                "backgroung_picture": defaults.background_default,
                "pic_back": defaults.default["pic_back"],
                "pic_bent": defaults.default["pic_bent"],
                "pic_line": defaults.default["pic_line"],
                "pic_rect": defaults.default["pic_rect"],
                "pic_BezierCurve": defaults.default["pic_BezierCurve"],
                "pic_eraser": defaults.default["pic_eraser"],
                "pic_logo": defaults.default["pic_logo"],
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
                'static/js/graphics.js',
                'static/js/pcxblock.js',
            )

            css_urls = (
                'static/css/pcxblock.css',
                'static/css/designer.css',
                'static/css/font.css',
            )

            self.load_resources(js_urls, css_urls, fragment)
        else:
            context = {
                "backgroung_picture": self.backgroung_picture,
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

        fragment.initialize_js('PCXBlock')
        return fragment

    # handlers

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        self.max_attempts = 100 #data.get('max_attempts')
        self.backgroung_picture = data.get('backgroung_picture')

        return {'result': 'success'}

    @XBlock.json_handler
    def student_submit(self, data, suffix=''):
        
        def pixels_count(img, color_min, color_max):
            color_min = np.array(color_min, np.uint8)
            color_max = np.array(color_max, np.uint8)
            dst = cv2.inRange(img, color_min, color_max)
            pix_count = cv2.countNonZero(dst)
            return pix_count

        def base64_to_image(base64image):
            image_data_base64 = base64image
            image_data_base64 = image_data_base64.replace('data:image/png;base64,', '')
            decode_img = base64.b64decode(image_data_base64)
            npimg = np.fromstring(decode_img, dtype=np.uint8)
            result_img = cv2.imdecode(npimg, 1)
            return result_img

        def thresh_callback(stud_pic, correct_pic, thick_cont, thresh):
            sp = copy.copy(stud_pic)
            cp = copy.copy(correct_pic)
            gray = cv2.cvtColor(cp, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(blur, thresh, thresh * 2)
            drawing = np.zeros(cp.shape, np.uint8)     # Image to draw the contours
            _, contours, hierarchy = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

            for cnt in contours:
                cv2.drawContours(drawing, [cnt], 0, (0, 255, 0), thick_cont)
                cv2.drawContours(sp, [cnt], 0, (255, 255, 255), thick_cont)
            return sp

        self.student_picture = data["picture"]
        student_picture_base64 = data["picture"]

        correct_image_base64 = defaults.correct_image
        correct_image = base64_to_image(correct_image_base64)
        student_image = base64_to_image(student_picture_base64)

        all_gray_student_pixels_cout = pixels_count(student_image, [70, 70, 70], [251, 251, 251])
        all_gray_correct_pixels_cout = pixels_count(correct_image, [70, 70, 70], [251, 251, 251])

        thickness_contour = 25
        diff = thresh_callback(student_image, correct_image, thickness_contour, 0)
        diff1 = thresh_callback(correct_image, student_image, thickness_contour, 0)

        gray_wrong_pixels_cout1 = pixels_count(diff1, [70, 70, 70], [251, 251, 251])
        gray_wrong_pixels_cout = pixels_count(diff, [70, 70, 70], [251, 251, 251])

        grade_first = 0
        grade_second = 0

        if all_gray_student_pixels_cout!=0:
            grade_first = float((all_gray_student_pixels_cout - gray_wrong_pixels_cout))/all_gray_student_pixels_cout
            grade_first = grade_first

            grade_second = float((all_gray_correct_pixels_cout - gray_wrong_pixels_cout1))/all_gray_correct_pixels_cout
            grade_second = grade_second

            grade_global = min(grade_first, grade_second) * max(grade_first, grade_second) * 100

            grade_global = int(grade_global)
        else:
            grade_global = 0

        self.points = grade_global
        self.attempts += 1
        #si = student_id(self)

        self.runtime.publish(self, 'grade', {
            'value': self.points,
            'max_value': self.weight,
        })

        return {"points": self.points, "grade_first": grade_first, "grade_second": grade_second}


def answer_opportunity(self):
    """
    Возможность ответа (если количество сделанное попыток меньше заданного).
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
