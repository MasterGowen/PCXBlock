import copy
import cv2
import base64
import numpy as np

def check_method(func):
    return func


#range in percent (0-100)
#return True if student hit in range
def equality_pixels(correct_pixels, student_pixels, range):
    correct_pixels_max = correct_pixels + (correct_pixels*range*0.01)
    correct_pixels_min = correct_pixels - (correct_pixels*range*0.01)
    if (student_pixels >= correct_pixels_min and student_pixels <= correct_pixels_max):
        return True
    else: return False

#return number of pixels with the color
def pixels_count(img, color_min, color_max):
    color_min = np.array(color_min, np.uint8)
    color_max = np.array(color_max, np.uint8)
    dst = cv2.inRange(img, color_min, color_max)
    pix_count = cv2.countNonZero(dst)
    return pix_count

#convert image in base64 to opencv image
def base64_to_image(base64image):
    image_data_base64 = base64image
    image_data_base64 = image_data_base64.replace('data:image/png;base64,', '')
    decode_img = base64.b64decode(image_data_base64)
    npimg = np.fromstring(decode_img, dtype=np.uint8)
    result_img = cv2.imdecode(npimg, 1)
    return result_img

#return black contours on picture with isolate color in range
def isolate_color(image, color_min, color_max):
    image_height, image_width, image_channels = image.shape
    lower_color = np.array(color_min, dtype=np.uint8)
    upper_color = np.array(color_max, dtype=np.uint8)
    #make mask
    mask = cv2.inRange(image, lower_color, upper_color)
    mask = 255 - mask
    #make new white image
    blank_image = np.zeros((image_height, image_width, 3), np.uint8)
    blank_image = 255 - blank_image
    #addition mask on white image
    result = cv2.bitwise_and(blank_image, blank_image, mask=mask)
    return result

#correct_pic(its upper layer) ON student_pic(its bottom layer)
#return image
def thresh_callback(stud_pic, correct_pic, thick_cont, thresh):
    sp = copy.copy(stud_pic)
    cp = copy.copy(correct_pic)
    gray = cv2.cvtColor(cp, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, thresh, thresh * 2)
    drawing = np.zeros(cp.shape, np.uint8)
    _, contours, hierarchy = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        cv2.drawContours(drawing, [cnt], 0, (0, 255, 0), thick_cont)
        cv2.drawContours(sp, [cnt], 0, (255, 255, 255), thick_cont)
    return sp


#return grade 0-100 for two images
def pixel_method(student_picture_base64, correct_picture_base64, thickness):
    #check color. black now
    line_color_min = [0, 0, 0]
    line_color_max = [200, 200, 200]
    correct_image = correct_picture_base64
    student_image = student_picture_base64
    all_color_student_pixels_count = pixels_count(student_image, line_color_min, line_color_max)
    all_color_correct_pixels_count = pixels_count(correct_image, line_color_min, line_color_max)
    thickness_contour = 20
    diff = thresh_callback(student_image, correct_image, thickness_contour, 0)
    diff1 = thresh_callback(correct_image, student_image, thickness_contour, 0)
    gray_wrong_pixels_count1 = pixels_count(diff1, line_color_min, line_color_max)
    gray_wrong_pixels_count = pixels_count(diff, line_color_min, line_color_max)
    if all_color_student_pixels_count > 50:
        grade_first = float((all_color_student_pixels_count - gray_wrong_pixels_count))/all_color_student_pixels_count
        grade_first = grade_first
        grade_second = float((all_color_correct_pixels_count - gray_wrong_pixels_count1))/all_color_correct_pixels_count
        grade_second = grade_second
        grade_global = min(grade_first, grade_second) * max(grade_first, grade_second) * 100
    else:
        grade_global = 0
    return grade_global

#list of line types present in the picture
def detect_used_lines_types(image, all_types):
    used_lines_list = []
    for line in all_types.keys():
        pix_count = pixels_count(image, all_types[line]["min_color"], all_types[line]["max_color"])
        #print line, pix_count
        if(pix_count > 50):
            used_lines_list.append(line)
    return used_lines_list
