# -*- coding=UTF-8 -*-
"""Gui interface.  """
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import logging
import os
import webbrowser
from multiprocessing.dummy import Pool, cpu_count

from Qt import QtCore, QtWidgets
from Qt.QtWidgets import QMessageBox

from wlf import cgtwq
from wlf.cgtwq import CGTeamWorkClient
from wlf.config import Config as BaseConfig
from wlf.decorators import run_with_memory_require
from wlf.ffmpeg import GenerateError
from wlf.files import copy
from wlf.notify import CancelledError, progress
from wlf.path import Path, PurePath, get_encoded
from wlf.uitools import DialogWithDir, main_show_dialog

from .__about__ import __version__
from .image import RESOURCES_DIR, HTMLImage, from_list, updated_config

LOGGER = logging.getLogger('com.wlf.csheet.dialog')


class Config(BaseConfig):
    """Comp config.  """

    default = {
        'PROJECT': '少年锦衣卫',
        'PIPELINE': '合成',
        'DATABASE': 'proj_big',
        'PREFIX': 'SNJYW_EP19_',
        'OUTDIR': 'E:/',
        'IS_GENERATE_PREVIEW': 2,
        'PACK': 0,
    }
    path = os.path.expanduser(u'~/.wlf.csheet.json')


CONFIG = Config()


class Dialog(DialogWithDir):
    """Main GUI dialog.  """

    default_note = '自上传工具提交'

    def __init__(self, parent=None):

        edits_key = {
            'comboBoxProject': 'PROJECT',
            'comboBoxPipeline': 'PIPELINE',
            'lineEditPrefix': 'PREFIX',
            'lineEditOutDir': 'OUTDIR',
            'checkBoxPack': 'PACK',
            'checkBoxPreview': 'IS_GENERATE_PREVIEW',
        }
        icons = {
            'toolButtonAskDir': QtWidgets.QStyle.SP_DialogOpenButton,
            None: QtWidgets.QStyle.SP_FileDialogListView,
        }
        super(Dialog, self).__init__(
            PurePath(__file__).parent / '__main__.ui',
            config=CONFIG,
            icons=icons,
            edits_key=edits_key,
            dir_edit='lineEditOutDir')

        self.labelVersion.setText('v{}'.format(__version__))

        # Project combo box
        project = cgtwq.Project()
        names = project.names()
        edit = self.comboBoxProject
        self.projects_databse = {
            i: project.get_info(i, 'database')for i in names}
        self.projects_code = {
            i: project.get_info(i, 'code')for i in names}
        proj_config = CONFIG['PROJECT']
        edit.insertItems(0, names)
        edit.setCurrentIndex(edit.findText(proj_config))

        # Signals
        self.actionDir.triggered.connect(self.ask_dir)
        self.comboBoxProject.currentIndexChanged.connect(self.auto_set_prefix)

        # TODO
        self.checkBoxThumb.setEnabled(False)

    @property
    def csheet_name(self):
        """Csheet filename.  """

        return '{}色板'.format('_'.join(
            i for i in [self.project_name,
                        self.prefix.strip(self.code).strip('_'),
                        self.pipeline] if i))

    @property
    def project_name(self):
        """Project name.  """

        return self.comboBoxProject.currentText()

    @property
    def code(self):
        """Project code.  """
        return self.projects_code.get(self.project_name, '')

    @property
    def pipeline(self):
        """Database pipeline.  """

        return self.comboBoxPipeline.currentText()

    @property
    def prefix(self):
        """Shots prefix limitation.  """

        return self.lineEditPrefix.text()

    @property
    def database(self):
        """Database name on cgtw.  """

        return self.projects_databse.get(
            self.project_name, CONFIG.default['DATABASE'])

    @property
    def is_pack(self):
        """If pack before create csheet.  """

        return self.checkBoxPack.checkState()

    @property
    def is_generate_thumb(self):
        """If generate thumbnails before create csheet.  """

        return self.checkBoxThumb.checkState()

    @property
    def is_generate_preview(self):
        """If generate thumbnails before create csheet.  """

        return self.checkBoxPreview.checkState()

    @property
    def save_dir(self):
        """Csheet save dir.  """

        if self.is_pack:
            return PurePath(self.directory) / self.csheet_name

        return PurePath(self.directory)

    def auto_set_prefix(self):
        """Set prefix according current project. """

        edit = self.lineEditPrefix
        project_name = self.comboBoxProject.currentText()
        text = self.projects_code[project_name]
        text = '{}_EP01_'.format(text)

        edit.setText(text)
        edit.setFocus(QtCore.Qt.ShortcutFocusReason)
        edit.setSelection(len(text) - 3, 2)

    def get_images(self):
        """Get images from database.  """

        related_pipeline = {'灯光':  '渲染'}
        try:
            for _ in progress((self.database,), '访问数据库', parent=self):
                shots = cgtwq.Shots(
                    self.database,
                    pipeline=self.pipeline,
                    prefix=self.prefix)

            # For pipelines thas has a another video related pipeline.
            if self.pipeline in related_pipeline:
                _pipeline = related_pipeline[self.pipeline]
                LOGGER.debug('Using related pipeline: %s', _pipeline)
                video_shots = cgtwq.Shots(
                    self.database,
                    pipeline=_pipeline,
                    prefix=self.prefix)
            else:
                video_shots = None

            images = []
            for shot in progress(shots.shots, '分析信息', parent=self):
                image = HTMLImage(shots.get_shot_image(shot))
                if image:
                    image.name = shot
                    _shots = video_shots if self.pipeline in related_pipeline else shots
                    image.preview_source = _shots.get_shot_submit_path(shot)
                    images.append(image)
            images.sort(key=lambda x: x.name)
            return images
        except cgtwq.IDError as ex:
            QMessageBox.critical(self, '找不到对应条目', str(ex))
            raise
        except cgtwq.PrefixError as ex:
            QMessageBox.critical(
                self, '无匹配镜头', '''
项目: {} <br>
流程: {} <br>
前缀: <span style="color:red;font-weight: bold">{}</span>
'''.format(self.project_name, self.pipeline, ex.prefix))
            raise

    def generate_index(self, images):
        """ Construct contactsheet.  """

        sheet = from_list(
            images,
            title=self.csheet_name,
            static_folder='static' if self.is_pack else RESOURCES_DIR,
            is_pack=self.is_pack
        )

        html_path = self.save_dir / '{}.html'.format(self.csheet_name)
        with Path(html_path).open('w', encoding='UTF-8') as f:
            f.write(sheet)
        webbrowser.open(get_encoded(html_path))

    def generate_previews(self, images):
        """Generate previews for images.  """

        height = {
            '动画': 180,
            '灯光': 200,
            '合成': 300,
        }.get(self.pipeline, None)

        errors = set()

        @run_with_memory_require(1)
        def _run(image):
            try:
                image.generate_preview(height=height)
            except GenerateError:
                LOGGER.error(
                    '%s: Cannot generate preview.', image, exc_info=True)
                errors.add(image)
            except:
                LOGGER.error(
                    'Unexcept error during generate preview.', exc_info=True)
                raise

        thread_count = cpu_count()
        pool = Pool(thread_count)
        for _ in progress(pool.imap_unordered(_run, images),
                          '生成预览', total=len(images), parent=self):
            pass
        pool.close()
        pool.join()
        if errors:
            QMessageBox.warning(self, '以下预览生成失败', '\n'.join(
                unicode(i) for i in sorted(errors)))

    def pack_images(self, images):
        """Pack images to self.save_dir.  """
        for i in progress(images, '打包图像', parent=self):
            assert isinstance(i, HTMLImage)
            i.download(self.save_dir)

    def pack_statics(self):
        """Pack static files to self.save_dir.  """

        for i in progress(updated_config()['static'], parent=self):
            copy(RESOURCES_DIR / i, unicode(self.save_dir / 'static') + '/')

    def accept(self):
        """Override QDialog.accept .  """

        try:
            images = self.get_images()
            if self.is_generate_preview:
                self.generate_previews(images)
            if self.is_pack:
                self.pack_images(images)
                self.pack_statics()
            self.generate_index(images)

            webbrowser.open(get_encoded(self.save_dir))

            super(Dialog, self).accept()
        except cgtwq.CGTeamWorkException:
            return
        except CancelledError:
            LOGGER.debug(u'用户取消创建色板')
        except:
            LOGGER.error('Unexcepted error', exc_info=True)
            raise


def show():
    if CGTeamWorkClient.is_logged_in():
        main_show_dialog(Dialog)
    else:
        dummy_app = QtWidgets.QApplication([])
        QtWidgets.QMessageBox.critical(
            None, '吾立方色板工具', '未登录CGTeamWork\n使用`-h`参数查看命令行用法')
