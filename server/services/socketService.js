const doubaoService = require('./doubaoService');

// 存储活跃的任务
const activeTasks = new Map();

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 处理文本分割请求
    socket.on('segment-text', async (data) => {
      const { text, segmentCount, customPrompt, taskId } = data;
      
      try {
        socket.emit('progress', {
          taskId,
          phase: 'analyzing',
          progress: 10,
          message: '正在分析文本内容...'
        });

        const result = await doubaoService.segmentText(text, segmentCount, customPrompt);
        
        socket.emit('progress', {
          taskId,
          phase: 'completed',
          progress: 100,
          message: '文本分割完成'
        });

        socket.emit('text-segmented', {
          taskId,
          success: true,
          segments: result.segments,
          segmentTypes: result.segmentTypes || []
        });
      } catch (error) {
        socket.emit('text-segmented', {
          taskId,
          success: false,
          error: error.message
        });
      }
    });

    // 处理批量图片生成请求
    socket.on('generate-images', async (data) => {
      const { 
        segments, 
        template, 
        style = 'modern', 
        removeWatermark = false, 
        taskId
      } = data;
      
      activeTasks.set(taskId, { socket, status: 'running' });

      try {
        socket.emit('progress', {
          taskId,
          phase: 'preparing',
          progress: 5,
          message: '准备生成图片...'
        });

        // 批量生成：处理所有segments
        const results = await doubaoService.generateBatchImages(
          segments,
          template,
          style,
          removeWatermark,
          (progressData) => {
            // 检查任务是否被取消
            const task = activeTasks.get(taskId);
            if (!task || task.status === 'cancelled') {
              throw new Error('任务已取消');
            }

            const progress = Math.round((progressData.current / progressData.total) * 90) + 5;
            socket.emit('progress', {
              taskId,
              phase: progressData.phase,
              progress,
              current: progressData.current,
              total: progressData.total,
              message: progressData.message
            });
          }
        );

        // 检查任务状态
        const task = activeTasks.get(taskId);
        if (task && task.status !== 'cancelled') {
          socket.emit('progress', {
            taskId,
            phase: 'completed',
            progress: 100,
            message: '所有图片生成完成'
          });

          socket.emit('images-generated', {
            taskId,
            success: true,
            results
          });
        }

      } catch (error) {
        const task = activeTasks.get(taskId);
        if (task && task.status !== 'cancelled') {
          socket.emit('images-generated', {
            taskId,
            success: false,
            error: error.message
          });
        }
        console.error('批量生成失败:', error);
      } finally {
        activeTasks.delete(taskId);
      }
    });

    // 处理任务取消
    socket.on('cancel-task', (data) => {
      const { taskId } = data;
      const task = activeTasks.get(taskId);
      
      if (task) {
        task.status = 'cancelled';
        socket.emit('task-cancelled', { taskId });
        console.log(`Task ${taskId} cancelled by client`);
      }
    });



    // 客户端断开连接
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // 清理该客户端的活跃任务
      for (const [taskId, task] of activeTasks.entries()) {
        if (task.socket.id === socket.id) {
          task.status = 'cancelled';
          activeTasks.delete(taskId);
        }
      }
    });
  });
}

module.exports = { setupSocketHandlers };