import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { EntityCatalogGraphCard } from '@backstage/plugin-catalog-graph';
import { MenuItem, MenuList, Paper, ClickAwayListener, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  wrapper: {
    position: 'relative',
  },
  contextMenu: {
    position: 'fixed',
    zIndex: 9999,
    minWidth: 140,
  },
  resetBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
});

export const CatalogGraphWithHide = () => {
  const classes = useStyles();
  const hiddenNodesRef = useRef<Set<string>>(new Set());
  const [, forceRender] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  const handleHide = useCallback(() => {
    if (!contextMenu) return;
    hiddenNodesRef.current.add(contextMenu.nodeId);
    forceRender(n => n + 1);
    setContextMenu(null);
  }, [contextMenu]);

  const handleReset = useCallback(() => {
    hiddenNodesRef.current.clear();
    forceRender(n => n + 1);
  }, []);

  const renderNode = useCallback(({ node }: { node: any }) => {
    const isHidden = hiddenNodesRef.current.has(node.id);

    const kind = (node.entity?.kind ?? '').toLowerCase();
    const name = node.entity?.metadata?.name ?? node.id;
    const display = name.length > 15 ? `${name.slice(0, 13)}…` : name;

    const colorMap: Record<string, { fill: string; stroke: string }> = {
      component: { fill: '#4CAF50', stroke: '#2E7D32' },
      api:       { fill: '#2196F3', stroke: '#1565C0' },
      system:    { fill: '#9C27B0', stroke: '#6A1B9A' },
      group:     { fill: '#FF9800', stroke: '#E65100' },
      domain:    { fill: '#F44336', stroke: '#B71C1C' },
      resource:  { fill: '#00BCD4', stroke: '#00838F' },
      user:      { fill: '#795548', stroke: '#4E342E' },
    };
    const { fill, stroke } = colorMap[kind] ?? { fill: '#607D8B', stroke: '#37474F' };

    // When hidden: render fully transparent + non-interactive so graph layout
    // stays intact but the node is invisible and unclickable.
    if (isHidden) {
      return (
        <g style={{ opacity: 0, pointerEvents: 'none' }}>
          <rect width={130} height={44} rx={7} x={-65} y={-22} fill={fill} stroke={stroke} strokeWidth={2} />
        </g>
      );
    }

    return (
      <g style={{ cursor: 'pointer' }}>
        {/* Visible node — pointer events ON so the graph's own click handler works */}
        <rect
          width={130}
          height={44}
          rx={7}
          x={-65}
          y={-22}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
        <text
          textAnchor="middle"
          y={-4}
          fill="#fff"
          fontSize={11}
          fontWeight={600}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {display}
        </text>
        <text
          textAnchor="middle"
          y={11}
          fill="rgba(255,255,255,0.75)"
          fontSize={9}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {kind.toUpperCase()}
        </text>

        {/*
          Transparent overlay rect — captures right-click only.
          Does NOT call stopPropagation so the graph's native left-click
          handler (node focus / navigation) still fires underneath.
        */}
        <rect
          width={130}
          height={44}
          rx={7}
          x={-65}
          y={-22}
          fill="transparent"
          stroke="none"
          onContextMenu={e => {
            e.preventDefault();
            // Intentionally NOT calling e.stopPropagation() — lets the
            // graph's own pointer handlers continue to work for left-clicks.
            setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
          }}
        />
      </g>
    );
  }, []); // stable ref — no graph remount on hide/show

  const hiddenCount = hiddenNodesRef.current.size;

  return (
    <div className={classes.wrapper}>
      {hiddenCount > 0 && (
        <Button
          className={classes.resetBtn}
          size="small"
          variant="outlined"
          onClick={handleReset}
        >
          Show all ({hiddenCount} hidden)
        </Button>
      )}

      <EntityCatalogGraphCard renderNode={renderNode} />

      {contextMenu &&
        createPortal(
          <ClickAwayListener onClickAway={() => setContextMenu(null)}>
            <Paper
              elevation={6}
              className={classes.contextMenu}
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <MenuList dense>
                <MenuItem onClick={handleHide}>Hide node</MenuItem>
                <MenuItem onClick={() => setContextMenu(null)}>Cancel</MenuItem>
              </MenuList>
            </Paper>
          </ClickAwayListener>,
          document.body,
        )}
    </div>
  );
};
